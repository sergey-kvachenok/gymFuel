import { logger } from './logger';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface RecoveryStrategy {
  name: string;
  description: string;
  shouldRetry: (error: Error, attempt: number) => boolean;
  getDelay: (attempt: number, config: RetryConfig) => number;
  onRetry: (error: Error, attempt: number, operation: string) => void;
  onMaxRetriesExceeded: (error: Error, operation: string, context: unknown) => void;
}

export interface RecoveryContext {
  operation: string;
  tableName?: string;
  userId?: number;
  recordId?: number;
  data?: unknown;
  timestamp: Date;
}

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager | null = null;
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
    retryableErrors: [
      'Database connection failed',
      'QuotaExceededError',
      'VersionError',
      'ConstraintError',
      'DataError',
      'TransactionInactiveError',
      'ReadOnlyError',
      'InvalidAccessError',
    ],
  };

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  constructor() {
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies(): void {
    // Default retry strategy for database operations
    this.addRecoveryStrategy('database', {
      name: 'Database Retry Strategy',
      description: 'Retries database operations with exponential backoff',
      shouldRetry: (error: Error, attempt: number) => {
        const config = this.getConfig('database');
        return attempt < config.maxRetries && this.isRetryableError(error, config.retryableErrors);
      },
      getDelay: (attempt: number, config: RetryConfig) => {
        const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
        return Math.min(delay, config.maxDelay);
      },
      onRetry: (error: Error, attempt: number, operation: string) => {
        logger.warn('RECOVERY', operation, `Retrying operation (attempt ${attempt + 1})`, {
          error: error.message,
          attempt,
        });
      },
      onMaxRetriesExceeded: (error: Error, operation: string, context: unknown) => {
        logger.error(
          'RECOVERY',
          operation,
          'Max retries exceeded, operation failed',
          error,
          context,
        );
      },
    });

    // Strategy for sync operations
    this.addRecoveryStrategy('sync', {
      name: 'Sync Retry Strategy',
      description: 'Retries sync operations with longer delays',
      shouldRetry: (error: Error, attempt: number) => {
        const config = this.getConfig('sync');
        return attempt < config.maxRetries && this.isRetryableError(error, config.retryableErrors);
      },
      getDelay: (attempt: number, config: RetryConfig) => {
        const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
        return Math.min(delay, config.maxDelay);
      },
      onRetry: (error: Error, attempt: number, operation: string) => {
        logger.warn('RECOVERY', operation, `Retrying sync operation (attempt ${attempt + 1})`, {
          error: error.message,
          attempt,
        });
      },
      onMaxRetriesExceeded: (error: Error, operation: string, context: unknown) => {
        logger.error('RECOVERY', operation, 'Max sync retries exceeded', error, context);
      },
    });

    // Strategy for critical operations (no retries, immediate fallback)
    this.addRecoveryStrategy('critical', {
      name: 'Critical Operation Strategy',
      description: 'No retries, immediate fallback for critical operations',
      shouldRetry: () => false,
      getDelay: () => 0,
      onRetry: () => {},
      onMaxRetriesExceeded: (error: Error, operation: string, context: unknown) => {
        logger.error(
          'RECOVERY',
          operation,
          'Critical operation failed, using fallback',
          error,
          context,
        );
      },
    });
  }

  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    return retryableErrors.some(
      (retryableError) =>
        error.message.includes(retryableError) || error.name.includes(retryableError),
    );
  }

  addRecoveryStrategy(name: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(name, strategy);
  }

  getRecoveryStrategy(name: string): RecoveryStrategy | undefined {
    return this.recoveryStrategies.get(name);
  }

  getConfig(strategyName: string): RetryConfig {
    // Return different configs based on strategy
    switch (strategyName) {
      case 'sync':
        return {
          ...this.defaultConfig,
          maxRetries: 5,
          baseDelay: 2000, // 2 seconds for sync operations
          maxDelay: 30000, // 30 seconds max
        };
      case 'critical':
        return {
          ...this.defaultConfig,
          maxRetries: 0, // No retries for critical operations
        };
      default:
        return this.defaultConfig;
    }
  }

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    strategyName: string = 'database',
    context?: Partial<RecoveryContext>,
  ): Promise<T> {
    const strategy = this.getRecoveryStrategy(strategyName);
    if (!strategy) {
      throw new Error(`Unknown recovery strategy: ${strategyName}`);
    }

    const config = this.getConfig(strategyName);
    const recoveryContext: RecoveryContext = {
      operation: context?.operation || 'unknown',
      tableName: context?.tableName,
      userId: context?.userId,
      recordId: context?.recordId,
      data: context?.data,
      timestamp: new Date(),
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation();

        if (attempt > 0) {
          logger.info(
            'RECOVERY',
            recoveryContext.operation,
            `Operation succeeded after ${attempt} retries`,
            { attempt, context: recoveryContext },
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (!strategy.shouldRetry(error as Error, attempt)) {
          logger.error(
            'RECOVERY',
            recoveryContext.operation,
            'Non-retryable error encountered',
            error as Error,
            { attempt, context: recoveryContext },
          );
          break;
        }

        if (attempt < config.maxRetries) {
          const delay = strategy.getDelay(attempt, config);
          strategy.onRetry(error as Error, attempt, recoveryContext.operation);

          logger.debug('RECOVERY', recoveryContext.operation, `Waiting ${delay}ms before retry`, {
            attempt,
            delay,
            context: recoveryContext,
          });

          await this.delay(delay);
        }
      }
    }

    strategy.onMaxRetriesExceeded(lastError!, recoveryContext.operation, recoveryContext);
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Data integrity recovery methods
  async validateDataIntegrity<T>(
    data: T,
    validator: (data: T) => boolean,
    context?: Partial<RecoveryContext>,
  ): Promise<boolean> {
    try {
      const isValid = validator(data);

      if (!isValid) {
        logger.warn('RECOVERY', 'validateDataIntegrity', 'Data integrity validation failed', {
          data,
          context,
        });
      }

      return isValid;
    } catch (error) {
      logger.error(
        'RECOVERY',
        'validateDataIntegrity',
        'Data integrity validation error',
        error as Error,
        { data, context },
      );
      return false;
    }
  }

  async repairDataIntegrity<T>(
    data: T,
    repairer: (data: T) => T,
    context?: Partial<RecoveryContext>,
  ): Promise<T> {
    try {
      logger.info('RECOVERY', 'repairDataIntegrity', 'Attempting to repair data integrity', {
        originalData: data,
        context,
      });

      const repairedData = repairer(data);

      logger.info('RECOVERY', 'repairDataIntegrity', 'Data integrity repair completed', {
        repairedData,
        context,
      });

      return repairedData;
    } catch (error) {
      logger.error(
        'RECOVERY',
        'repairDataIntegrity',
        'Data integrity repair failed',
        error as Error,
        { data, context },
      );
      throw error;
    }
  }

  // Fallback mechanisms
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context?: Partial<RecoveryContext>,
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      logger.warn('RECOVERY', 'executeWithFallback', 'Primary operation failed, using fallback', {
        error: (error as Error).message,
        context,
      });

      try {
        const fallbackResult = await fallbackOperation();

        logger.info('RECOVERY', 'executeWithFallback', 'Fallback operation succeeded', { context });

        return fallbackResult;
      } catch (fallbackError) {
        logger.error(
          'RECOVERY',
          'executeWithFallback',
          'Both primary and fallback operations failed',
          fallbackError as Error,
          { originalError: error, context },
        );
        throw fallbackError;
      }
    }
  }

  // Circuit breaker pattern
  private circuitBreakerStates: Map<
    string,
    { failures: number; lastFailure: number; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }
  > = new Map();

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    operationName: string,
    failureThreshold: number = 5,
    timeout: number = 60000, // 1 minute
    context?: Partial<RecoveryContext>,
  ): Promise<T> {
    const circuitState = this.getCircuitBreakerState(operationName);

    if (circuitState.state === 'OPEN') {
      if (Date.now() - circuitState.lastFailure > timeout) {
        circuitState.state = 'HALF_OPEN';
        logger.info(
          'RECOVERY',
          'executeWithCircuitBreaker',
          'Circuit breaker transitioning to HALF_OPEN',
          { operationName, context },
        );
      } else {
        throw new Error(`Circuit breaker is OPEN for operation: ${operationName}`);
      }
    }

    try {
      const result = await operation();

      if (circuitState.state === 'HALF_OPEN') {
        circuitState.state = 'CLOSED';
        circuitState.failures = 0;
        logger.info('RECOVERY', 'executeWithCircuitBreaker', 'Circuit breaker reset to CLOSED', {
          operationName,
          context,
        });
      }

      return result;
    } catch (error) {
      circuitState.failures++;
      circuitState.lastFailure = Date.now();

      if (circuitState.failures >= failureThreshold) {
        circuitState.state = 'OPEN';
        logger.error(
          'RECOVERY',
          'executeWithCircuitBreaker',
          'Circuit breaker opened due to repeated failures',
          error as Error,
          { operationName, failures: circuitState.failures, context },
        );
      }

      throw error;
    }
  }

  private getCircuitBreakerState(operationName: string) {
    if (!this.circuitBreakerStates.has(operationName)) {
      this.circuitBreakerStates.set(operationName, {
        failures: 0,
        lastFailure: 0,
        state: 'CLOSED' as const,
      });
    }
    return this.circuitBreakerStates.get(operationName)!;
  }

  // Recovery statistics
  getRecoveryStats(): {
    totalRetries: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    circuitBreakerStates: Record<string, string>;
  } {
    // This would be implemented with actual statistics tracking
    return {
      totalRetries: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      circuitBreakerStates: Object.fromEntries(
        Array.from(this.circuitBreakerStates.entries()).map(([name, state]) => [name, state.state]),
      ),
    };
  }
}

export const errorRecoveryManager = ErrorRecoveryManager.getInstance();

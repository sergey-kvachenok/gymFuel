export interface SyncError {
  type: 'initialization' | 'connection' | 'sync' | 'disposal';
  message: string;
  timestamp: Date;
  retryable: boolean;
  originalError?: Error;
}

export interface SyncErrorContext {
  userId?: number;
  operation?: string;
  dataType?: 'products' | 'consumptions' | 'nutritionGoals';
}

/**
 * Handles sync-related errors with proper categorization and recovery strategies
 */
export class SyncErrorHandler {
  private errors: SyncError[] = [];
  private maxErrors: number = 100;
  private errorListeners: ((error: SyncError) => void)[] = [];

  /**
   * Log a sync error with context
   */
  logError(
    type: SyncError['type'],
    message: string,
    context?: SyncErrorContext,
    originalError?: Error,
  ): void {
    const error: SyncError = {
      type,
      message,
      timestamp: new Date(),
      retryable: this.isRetryableError(type, message),
      originalError,
    };

    this.errors.push(error);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Notify listeners
    this.notifyErrorListeners(error);

    // Log to console with context
    console.error(`[Sync Error - ${type}] ${message}`, {
      context,
      timestamp: error.timestamp,
      retryable: error.retryable,
      originalError: originalError?.stack,
    });
  }

  /**
   * Get all logged errors
   */
  getErrors(): SyncError[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: SyncError['type']): SyncError[] {
    return this.errors.filter((error) => error.type === type);
  }

  /**
   * Get recent errors (last N errors)
   */
  getRecentErrors(count: number = 10): SyncError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Clear errors by type
   */
  clearErrorsByType(type: SyncError['type']): void {
    this.errors = this.errors.filter((error) => error.type !== type);
  }

  /**
   * Check if there are any critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errors.some((error) => !error.retryable);
  }

  /**
   * Check if there are retryable errors
   */
  hasRetryableErrors(): boolean {
    return this.errors.some((error) => error.retryable);
  }

  /**
   * Get the most recent error
   */
  getLastError(): SyncError | null {
    return this.errors.length > 0 ? this.errors[this.errors.length - 1] : null;
  }

  /**
   * Register an error listener
   */
  onError(listener: (error: SyncError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove an error listener
   */
  removeErrorListener(listener: (error: SyncError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Determine if an error is retryable based on type and message
   */
  private isRetryableError(type: SyncError['type'], message: string): boolean {
    // Network-related errors are usually retryable
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout')
    ) {
      return true;
    }

    // Sync errors are often retryable
    if (type === 'sync') {
      return true;
    }

    // Initialization errors are usually not retryable (require app restart)
    if (type === 'initialization') {
      return false;
    }

    // Disposal errors are not retryable
    if (type === 'disposal') {
      return false;
    }

    // Default to retryable for unknown cases
    return true;
  }

  /**
   * Notify all error listeners
   */
  private notifyErrorListeners(error: SyncError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in sync error listener:', listenerError);
      }
    });
  }
}

// Singleton instance
export const syncErrorHandler = new SyncErrorHandler();

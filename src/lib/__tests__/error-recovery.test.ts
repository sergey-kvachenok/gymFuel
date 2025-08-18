import { errorRecoveryManager, RecoveryStrategy, RecoveryContext } from '../error-recovery';

// Mock the logger to avoid console output during tests
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logDbOperation: jest.fn(),
    logSyncOperation: jest.fn(),
    logErrorOperation: jest.fn(),
    startOperation: jest.fn(),
    endOperation: jest.fn(),
    getLogs: jest.fn(),
    clearLogs: jest.fn(),
    clearPerformanceMetrics: jest.fn(),
  },
}));

describe('ErrorRecoveryManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should maintain singleton instance', () => {
      const instance1 = errorRecoveryManager;
      const instance2 = errorRecoveryManager;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Recovery Strategies', () => {
    it('should have default strategies initialized', () => {
      const databaseStrategy = errorRecoveryManager.getRecoveryStrategy('database');
      const syncStrategy = errorRecoveryManager.getRecoveryStrategy('sync');
      const criticalStrategy = errorRecoveryManager.getRecoveryStrategy('critical');

      expect(databaseStrategy).toBeDefined();
      expect(syncStrategy).toBeDefined();
      expect(criticalStrategy).toBeDefined();

      expect(databaseStrategy?.name).toBe('Database Retry Strategy');
      expect(syncStrategy?.name).toBe('Sync Retry Strategy');
      expect(criticalStrategy?.name).toBe('Critical Operation Strategy');
    });

    it('should allow adding custom recovery strategies', () => {
      const customStrategy: RecoveryStrategy = {
        name: 'Custom Strategy',
        description: 'A custom recovery strategy for testing',
        shouldRetry: () => true,
        getDelay: () => 1000,
        onRetry: jest.fn(),
        onMaxRetriesExceeded: jest.fn(),
      };

      errorRecoveryManager.addRecoveryStrategy('custom', customStrategy);
      const retrievedStrategy = errorRecoveryManager.getRecoveryStrategy('custom');

      expect(retrievedStrategy).toBe(customStrategy);
    });

    it('should return undefined for unknown strategies', () => {
      const strategy = errorRecoveryManager.getRecoveryStrategy('unknown');
      expect(strategy).toBeUndefined();
    });
  });

  describe('Configuration', () => {
    it('should return correct config for database strategy', () => {
      const config = errorRecoveryManager.getConfig('database');
      expect(config.maxRetries).toBe(3);
      expect(config.baseDelay).toBe(1000);
      expect(config.maxDelay).toBe(10000);
      expect(config.backoffMultiplier).toBe(2);
      expect(config.retryableErrors).toContain('Database connection failed');
    });

    it('should return correct config for sync strategy', () => {
      const config = errorRecoveryManager.getConfig('sync');
      expect(config.maxRetries).toBe(5);
      expect(config.baseDelay).toBe(2000);
      expect(config.maxDelay).toBe(30000);
    });

    it('should return correct config for critical strategy', () => {
      const config = errorRecoveryManager.getConfig('critical');
      expect(config.maxRetries).toBe(0);
    });
  });

  describe('Execute with Recovery', () => {
    it('should execute successful operation without retries', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const context: Partial<RecoveryContext> = {
        operation: 'testOperation',
        tableName: 'products',
        userId: 1,
      };

      const result = await errorRecoveryManager.executeWithRecovery(
        operation,
        'database',
        context,
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry operation on retryable error', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Database connection failed'))
        .mockResolvedValue('success');

      const result = await errorRecoveryManager.executeWithRecovery(
        operation,
        'database',
        { operation: 'testOperation' },
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Non-retryable error'));

      await expect(
        errorRecoveryManager.executeWithRecovery(operation, 'database', {
          operation: 'testOperation',
        }),
      ).rejects.toThrow('Non-retryable error');

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries limit', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        errorRecoveryManager.executeWithRecovery(operation, 'database', {
          operation: 'testOperation',
        }),
      ).rejects.toThrow('Database connection failed');

      // Should be called 4 times: initial + 3 retries
      expect(operation).toHaveBeenCalledTimes(4);
    }, 10000); // Increase timeout for retry tests

    it('should throw error for unknown strategy', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await expect(
        errorRecoveryManager.executeWithRecovery(operation, 'unknown', {
          operation: 'testOperation',
        }),
      ).rejects.toThrow('Unknown recovery strategy: unknown');
    });

    it('should use exponential backoff for delays', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Database connection failed'))
        .mockRejectedValueOnce(new Error('Database connection failed'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await errorRecoveryManager.executeWithRecovery(operation, 'database', {
        operation: 'testOperation',
      });
      const endTime = Date.now();

      // Should have delays: 1000ms + 2000ms = 3000ms minimum
      expect(endTime - startTime).toBeGreaterThanOrEqual(3000);
      expect(operation).toHaveBeenCalledTimes(3);
    }, 10000); // Increase timeout for retry tests
  });

  describe('Data Integrity', () => {
    it('should validate data integrity correctly', async () => {
      const validData = { id: 1, name: 'test' };
      const invalidData = { id: 1, name: '' };

      const validator = (data: { id: number; name: string }) => data.name.length > 0;

      const validResult = await errorRecoveryManager.validateDataIntegrity(
        validData,
        validator,
        { operation: 'test' },
      );
      const invalidResult = await errorRecoveryManager.validateDataIntegrity(
        invalidData,
        validator,
        { operation: 'test' },
      );

      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
    });

    it('should handle validation errors gracefully', async () => {
      const data = { id: 1 };
      const validator = () => {
        throw new Error('Validation error');
      };

      const result = await errorRecoveryManager.validateDataIntegrity(
        data,
        validator,
        { operation: 'test' },
      );

      expect(result).toBe(false);
    });

    it('should repair data integrity correctly', async () => {
      const originalData = { id: 1, name: '', value: -5 };
      const repairer = (data: { id: number; name: string; value: number }) => ({
        ...data,
        name: data.name || 'default',
        value: Math.max(0, data.value),
      });

      const repairedData = await errorRecoveryManager.repairDataIntegrity(
        originalData,
        repairer,
        { operation: 'test' },
      );

      expect(repairedData.name).toBe('default');
      expect(repairedData.value).toBe(0);
    });

    it('should handle repair errors', async () => {
      const data = { id: 1 };
      const repairer = () => {
        throw new Error('Repair error');
      };

      await expect(
        errorRecoveryManager.repairDataIntegrity(data, repairer, { operation: 'test' }),
      ).rejects.toThrow('Repair error');
    });
  });

  describe('Fallback Mechanisms', () => {
    it('should execute fallback when primary operation fails', async () => {
      const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackOperation = jest.fn().mockResolvedValue('fallback success');

      const result = await errorRecoveryManager.executeWithFallback(
        primaryOperation,
        fallbackOperation,
        { operation: 'test' },
      );

      expect(result).toBe('fallback success');
      expect(primaryOperation).toHaveBeenCalledTimes(1);
      expect(fallbackOperation).toHaveBeenCalledTimes(1);
    });

    it('should execute primary operation when it succeeds', async () => {
      const primaryOperation = jest.fn().mockResolvedValue('primary success');
      const fallbackOperation = jest.fn().mockResolvedValue('fallback success');

      const result = await errorRecoveryManager.executeWithFallback(
        primaryOperation,
        fallbackOperation,
        { operation: 'test' },
      );

      expect(result).toBe('primary success');
      expect(primaryOperation).toHaveBeenCalledTimes(1);
      expect(fallbackOperation).not.toHaveBeenCalled();
    });

    it('should throw error when both operations fail', async () => {
      const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackOperation = jest.fn().mockRejectedValue(new Error('Fallback failed'));

      await expect(
        errorRecoveryManager.executeWithFallback(
          primaryOperation,
          fallbackOperation,
          { operation: 'test' },
        ),
      ).rejects.toThrow('Fallback failed');
    });
  });

  describe('Circuit Breaker', () => {
    beforeEach(() => {
      // Reset circuit breaker state between tests
      jest.clearAllMocks();
    });

    it('should execute operation when circuit is closed', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await errorRecoveryManager.executeWithCircuitBreaker(
        operation,
        'testOperation1', // Use unique operation name
        3,
        1000,
        { operation: 'test' },
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after threshold failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // First 3 failures should be allowed
      for (let i = 0; i < 3; i++) {
        await expect(
          errorRecoveryManager.executeWithCircuitBreaker(
            operation,
            'testOperation2', // Use unique operation name
            3,
            1000,
            { operation: 'test' },
          ),
        ).rejects.toThrow('Operation failed');
      }

      // 4th failure should open the circuit
      await expect(
        errorRecoveryManager.executeWithCircuitBreaker(
          operation,
          'testOperation2',
          3,
          1000,
          { operation: 'test' },
        ),
      ).rejects.toThrow('Circuit breaker is OPEN for operation: testOperation2');

      expect(operation).toHaveBeenCalledTimes(3); // Only 3 calls, 4th is blocked
    });

    it('should transition to half-open after timeout', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // Open the circuit
      for (let i = 0; i < 4; i++) {
        try {
          await errorRecoveryManager.executeWithCircuitBreaker(
            operation,
            'testOperation3', // Use unique operation name
            3,
            100, // Short timeout for testing
            { operation: 'test' },
          );
        } catch {
          // Expected to fail
        }
      }

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should transition to half-open and allow one more attempt
      await expect(
        errorRecoveryManager.executeWithCircuitBreaker(
          operation,
          'testOperation3', // Use unique operation name
          3,
          100,
          { operation: 'test' },
        ),
      ).rejects.toThrow('Operation failed');

      expect(operation).toHaveBeenCalledTimes(4); // 3 initial + 1 half-open attempt
    });

    it('should close circuit after successful operation in half-open state', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const succeedingOperation = jest.fn().mockResolvedValue('success');

      // Open the circuit
      for (let i = 0; i < 4; i++) {
        try {
          await errorRecoveryManager.executeWithCircuitBreaker(
            failingOperation,
            'testOperation4', // Use unique operation name
            3,
            100,
            { operation: 'test' },
          );
        } catch {
          // Expected to fail
        }
      }

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should succeed and close the circuit
      const result = await errorRecoveryManager.executeWithCircuitBreaker(
        succeedingOperation,
        'testOperation4',
        3,
        100,
        { operation: 'test' },
      );

      expect(result).toBe('success');
      expect(failingOperation).toHaveBeenCalledTimes(3); // Only 3 calls, 4th is blocked
      expect(succeedingOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Recovery Statistics', () => {
    it('should return recovery statistics', () => {
      const stats = errorRecoveryManager.getRecoveryStats();

      expect(stats).toHaveProperty('totalRetries');
      expect(stats).toHaveProperty('successfulRecoveries');
      expect(stats).toHaveProperty('failedRecoveries');
      expect(stats).toHaveProperty('circuitBreakerStates');
      expect(typeof stats.circuitBreakerStates).toBe('object');
    });
  });

  describe('Error Classification', () => {
    it('should correctly identify retryable errors', async () => {
      // Test with just one retryable error to avoid timeout
      const errorMessage = 'Database connection failed';
      const operation = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Should retry at least once
      await expect(
        errorRecoveryManager.executeWithRecovery(operation, 'database', {
          operation: 'test',
        }),
      ).rejects.toThrow(errorMessage);

      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries (max retries)
    }, 10000); // Increase timeout for retry test

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new Error('Non-retryable error message');
      const operation = jest.fn().mockRejectedValue(nonRetryableError);

      await expect(
        errorRecoveryManager.executeWithRecovery(operation, 'database', {
          operation: 'test',
        }),
      ).rejects.toThrow('Non-retryable error message');

      expect(operation).toHaveBeenCalledTimes(1); // Only initial attempt
    });
  });

  describe('Context Handling', () => {
    it('should properly handle recovery context', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const context: Partial<RecoveryContext> = {
        operation: 'testOperation',
        tableName: 'products',
        userId: 123,
        recordId: 456,
        data: { test: 'data' },
      };

      await errorRecoveryManager.executeWithRecovery(operation, 'database', context);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle missing context gracefully', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await errorRecoveryManager.executeWithRecovery(operation, 'database');

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});

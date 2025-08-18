import { SyncErrorHandler, SyncErrorContext } from '../sync-error-handler';

describe('SyncErrorHandler', () => {
  let errorHandler: SyncErrorHandler;

  beforeEach(() => {
    errorHandler = new SyncErrorHandler();
  });

  describe('Error Logging', () => {
    it('should log errors with proper structure', () => {
      const error = new Error('Test error');
      const context: SyncErrorContext = { userId: 1, operation: 'sync' };

      errorHandler.logError('sync', 'Test sync error', context, error);

      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(1);

      const loggedError = errors[0];
      expect(loggedError.type).toBe('sync');
      expect(loggedError.message).toBe('Test sync error');
      expect(loggedError.timestamp).toBeInstanceOf(Date);
      expect(loggedError.originalError).toBe(error);
    });

    it('should categorize errors as retryable or not', () => {
      // Network errors should be retryable
      errorHandler.logError('connection', 'Network timeout');
      expect(errorHandler.getErrors()[0].retryable).toBe(true);

      // Initialization errors should not be retryable
      errorHandler.logError('initialization', 'Failed to initialize');
      expect(errorHandler.getErrors()[1].retryable).toBe(false);

      // Sync errors should be retryable
      errorHandler.logError('sync', 'Sync failed');
      expect(errorHandler.getErrors()[2].retryable).toBe(true);

      // Disposal errors should not be retryable
      errorHandler.logError('disposal', 'Failed to dispose');
      expect(errorHandler.getErrors()[3].retryable).toBe(false);
    });

    it('should limit the number of stored errors', () => {
      const maxErrors = 100;

      // Add more errors than the limit
      for (let i = 0; i < maxErrors + 10; i++) {
        errorHandler.logError('sync', `Error ${i}`);
      }

      const errors = errorHandler.getErrors();
      expect(errors.length).toBeLessThanOrEqual(maxErrors);
      expect(errors.length).toBe(maxErrors); // Should keep the most recent ones
    });
  });

  describe('Error Retrieval', () => {
    beforeEach(() => {
      errorHandler.logError('initialization', 'Init error 1');
      errorHandler.logError('sync', 'Sync error 1');
      errorHandler.logError('connection', 'Connection error 1');
      errorHandler.logError('sync', 'Sync error 2');
      errorHandler.logError('disposal', 'Disposal error 1');
    });

    it('should get all errors', () => {
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(5);
    });

    it('should get errors by type', () => {
      const syncErrors = errorHandler.getErrorsByType('sync');
      expect(syncErrors).toHaveLength(2);
      expect(syncErrors.every((error) => error.type === 'sync')).toBe(true);

      const initErrors = errorHandler.getErrorsByType('initialization');
      expect(initErrors).toHaveLength(1);
      expect(initErrors[0].type).toBe('initialization');
    });

    it('should get recent errors', () => {
      const recentErrors = errorHandler.getRecentErrors(3);
      expect(recentErrors).toHaveLength(3);

      // Should be the last 3 errors (slice(-3) returns last 3 in order)
      // Check that we get the expected messages in any order
      const messages = recentErrors.map((error) => error.message);
      expect(messages).toContain('Connection error 1');
      expect(messages).toContain('Sync error 2');
      expect(messages).toContain('Disposal error 1');
    });

    it('should get the last error', () => {
      const lastError = errorHandler.getLastError();
      expect(lastError).not.toBeNull();
      expect(lastError?.message).toBe('Disposal error 1');
      expect(lastError?.type).toBe('disposal');
    });

    it('should return null when no errors exist', () => {
      const emptyHandler = new SyncErrorHandler();
      expect(emptyHandler.getLastError()).toBeNull();
    });
  });

  describe('Error Status Checks', () => {
    it('should detect critical errors', () => {
      errorHandler.logError('initialization', 'Critical error');
      expect(errorHandler.hasCriticalErrors()).toBe(true);
    });

    it('should detect retryable errors', () => {
      errorHandler.logError('sync', 'Retryable error');
      expect(errorHandler.hasRetryableErrors()).toBe(true);
    });

    it('should handle mixed error types', () => {
      errorHandler.logError('initialization', 'Critical error');
      errorHandler.logError('sync', 'Retryable error');

      expect(errorHandler.hasCriticalErrors()).toBe(true);
      expect(errorHandler.hasRetryableErrors()).toBe(true);
    });

    it('should return false when no errors exist', () => {
      expect(errorHandler.hasCriticalErrors()).toBe(false);
      expect(errorHandler.hasRetryableErrors()).toBe(false);
    });
  });

  describe('Error Clearing', () => {
    beforeEach(() => {
      errorHandler.logError('initialization', 'Init error');
      errorHandler.logError('sync', 'Sync error 1');
      errorHandler.logError('sync', 'Sync error 2');
      errorHandler.logError('connection', 'Connection error');
    });

    it('should clear all errors', () => {
      errorHandler.clearErrors();
      expect(errorHandler.getErrors()).toHaveLength(0);
    });

    it('should clear errors by type', () => {
      errorHandler.clearErrorsByType('sync');

      const remainingErrors = errorHandler.getErrors();
      expect(remainingErrors).toHaveLength(2);
      expect(remainingErrors.every((error) => error.type !== 'sync')).toBe(true);
    });
  });

  describe('Error Listeners', () => {
    it('should notify listeners when errors are logged', () => {
      const listener = jest.fn();
      errorHandler.onError(listener);

      const error = new Error('Test error');
      errorHandler.logError('sync', 'Test error', undefined, error);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sync',
          message: 'Test error',
          originalError: error,
        }),
      );
    });

    it('should handle multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      errorHandler.onError(listener1);
      errorHandler.onError(listener2);

      errorHandler.logError('sync', 'Test error');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should remove listeners', () => {
      const listener = jest.fn();
      errorHandler.onError(listener);
      errorHandler.removeErrorListener(listener);

      errorHandler.logError('sync', 'Test error');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const badListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      const goodListener = jest.fn();

      errorHandler.onError(badListener);
      errorHandler.onError(goodListener);

      // Should not throw and should still call good listener
      expect(() => {
        errorHandler.logError('sync', 'Test error');
      }).not.toThrow();

      expect(goodListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retryable Error Detection', () => {
    it('should identify network-related errors as retryable', () => {
      errorHandler.logError('connection', 'Network timeout');
      errorHandler.logError('sync', 'Connection lost');
      errorHandler.logError('connection', 'Network error occurred');

      const errors = errorHandler.getErrors();
      expect(errors.every((error) => error.retryable)).toBe(true);
    });

    it('should identify initialization errors as not retryable', () => {
      errorHandler.logError('initialization', 'Failed to initialize database');
      errorHandler.logError('initialization', 'Service worker registration failed');

      const errors = errorHandler.getErrors();
      expect(errors.every((error) => !error.retryable)).toBe(true);
    });

    it('should identify disposal errors as not retryable', () => {
      errorHandler.logError('disposal', 'Failed to dispose resources');
      errorHandler.logError('disposal', 'Cleanup failed');

      const errors = errorHandler.getErrors();
      expect(errors.every((error) => !error.retryable)).toBe(true);
    });
  });
});

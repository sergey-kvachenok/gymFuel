import { logger, LogLevel, LogEntry, PerformanceMetrics } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear logs and metrics before each test
    logger.clearLogs();
    logger.clearPerformanceMetrics();
    logger.setLogLevel(LogLevel.DEBUG);
  });

  describe('Log Level Management', () => {
    it('should respect log level settings', () => {
      logger.setLogLevel(LogLevel.WARN);

      // These should not be logged
      logger.debug('TEST', 'test', 'debug message');
      logger.info('TEST', 'test', 'info message');

      // These should be logged
      logger.warn('TEST', 'test', 'warn message');
      logger.error('TEST', 'test', 'error message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('warn message');
      expect(logs[1].message).toBe('error message');
    });

    it('should log all levels when set to DEBUG', () => {
      logger.setLogLevel(LogLevel.DEBUG);

      logger.debug('TEST', 'test', 'debug message');
      logger.info('TEST', 'test', 'info message');
      logger.warn('TEST', 'test', 'warn message');
      logger.error('TEST', 'test', 'error message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
    });
  });

  describe('Basic Logging', () => {
    it('should create log entries with correct structure', () => {
      const testData = { test: 'data' };
      logger.info('TEST', 'testOperation', 'test message', testData, 123, 'products', 456);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.level).toBe(LogLevel.INFO);
      expect(log.category).toBe('TEST');
      expect(log.operation).toBe('testOperation');
      expect(log.message).toBe('test message');
      expect(log.data).toEqual(testData);
      expect(log.userId).toBe(123);
      expect(log.tableName).toBe('products');
      expect(log.recordId).toBe(456);
      expect(log.timestamp).toBeDefined();
      expect(log.error).toBeUndefined();
    });

    it('should handle error logging correctly', () => {
      const error = new Error('Test error');
      const testData = { test: 'data' };

      logger.error('TEST', 'testOperation', 'error message', error, testData, 123, 'products', 456);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.level).toBe(LogLevel.ERROR);
      expect(log.error).toBe(error);
      expect(log.data).toEqual(testData);
    });
  });

  describe('Performance Tracking', () => {
    it('should track operation performance', () => {
      const operationId = logger.startOperation('testOperation', 'products', 123);

      // Simulate some work
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait for at least 10ms
      }

      logger.endOperation(operationId, 'testOperation', 15, 'products', 123, 5);

      const metrics = logger.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);

      const metric = metrics[0];
      expect(metric.operation).toBe('testOperation');
      expect(metric.duration).toBe(15);
      expect(metric.tableName).toBe('products');
      expect(metric.userId).toBe(123);
      expect(metric.recordCount).toBe(5);
      expect(metric.timestamp).toBeDefined();
    });

    it('should calculate average performance correctly', () => {
      logger.endOperation('op1', 'testOperation', 10, 'products', 123, 1);
      logger.endOperation('op2', 'testOperation', 20, 'products', 123, 1);
      logger.endOperation('op3', 'testOperation', 30, 'products', 123, 1);

      const average = logger.getAveragePerformance('testOperation');
      expect(average).toBe(20); // (10 + 20 + 30) / 3
    });

    it('should return 0 for average when no metrics exist', () => {
      const average = logger.getAveragePerformance('nonexistent');
      expect(average).toBe(0);
    });
  });

  describe('Database Operation Logging', () => {
    it('should log database operations correctly', () => {
      const testData = { id: 1, name: 'test' };
      logger.logDbOperation('createProduct', 'products', 'Product created', testData, 123, 1, 50);

      const logs = logger.getLogs(undefined, 'DATABASE');
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.category).toBe('DATABASE');
      expect(log.operation).toBe('createProduct');
      expect(log.tableName).toBe('products');
      expect(log.userId).toBe(123);
      expect(log.recordId).toBe(1);
      expect(log.duration).toBe(50);
    });

    it('should log database errors correctly', () => {
      const error = new Error('Database connection failed');
      const testData = { id: 1 };

      logger.logDbOperation(
        'createProduct',
        'products',
        'Database error',
        testData,
        123,
        1,
        undefined,
        error,
      );

      const logs = logger.getLogs(LogLevel.ERROR, 'DATABASE');
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.level).toBe(LogLevel.ERROR);
      expect(log.error).toBe(error);
    });
  });

  describe('Sync Operation Logging', () => {
    it('should log sync operations correctly', () => {
      const testData = { tableName: 'products', id: 1 };
      logger.logSyncOperation('markAsSynced', 'Item synced', testData, 123, 'products', 1);

      const logs = logger.getLogs(undefined, 'SYNC');
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.category).toBe('SYNC');
      expect(log.operation).toBe('markAsSynced');
      expect(log.tableName).toBe('products');
      expect(log.userId).toBe(123);
      expect(log.recordId).toBe(1);
    });

    it('should log sync errors correctly', () => {
      const error = new Error('Sync failed');
      const testData = { tableName: 'products', id: 1 };

      logger.logSyncOperation('markAsSynced', 'Sync error', testData, 123, 'products', 1, error);

      const logs = logger.getLogs(LogLevel.ERROR, 'SYNC');
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.level).toBe(LogLevel.ERROR);
      expect(log.error).toBe(error);
    });
  });

  describe('Error Operation Logging', () => {
    it('should log error operations correctly', () => {
      const error = new Error('Test error');
      const testData = { operation: 'createProduct' };

      logger.logErrorOperation(
        'createProduct',
        'Operation failed',
        error,
        testData,
        123,
        'products',
        1,
      );

      const logs = logger.getLogs(LogLevel.ERROR, 'ERROR');
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log.category).toBe('ERROR');
      expect(log.operation).toBe('createProduct');
      expect(log.error).toBe(error);
      expect(log.data).toEqual(testData);
    });
  });

  describe('Log Filtering and Retrieval', () => {
    beforeEach(() => {
      // Create test logs
      logger.info('TEST1', 'op1', 'message 1', undefined, 1);
      logger.warn('TEST2', 'op2', 'message 2', undefined, 2);
      logger.error('TEST3', 'op3', 'message 3', new Error('test'), undefined, 3);
      logger.info('TEST1', 'op4', 'message 4', undefined, 4);
    });

    it('should filter logs by level', () => {
      const errorLogs = logger.getLogs(LogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe(LogLevel.ERROR);
    });

    it('should filter logs by category', () => {
      const test1Logs = logger.getLogs(undefined, 'TEST1');
      expect(test1Logs).toHaveLength(2);
      expect(test1Logs.every((log) => log.category === 'TEST1')).toBe(true);
    });

    it('should limit log results', () => {
      const limitedLogs = logger.getLogs(undefined, undefined, 2);
      expect(limitedLogs).toHaveLength(2);
    });

    it('should combine filters correctly', () => {
      const filteredLogs = logger.getLogs(LogLevel.INFO, 'TEST1', 1);
      expect(filteredLogs).toHaveLength(1);
      expect(filteredLogs[0].level).toBe(LogLevel.INFO);
      expect(filteredLogs[0].category).toBe('TEST1');
    });
  });

  describe('Performance Metrics Filtering', () => {
    beforeEach(() => {
      // Create test metrics
      logger.endOperation('op1', 'operation1', 10, 'products', 1, 1);
      logger.endOperation('op2', 'operation2', 20, 'consumptions', 2, 1);
      logger.endOperation('op3', 'operation1', 30, 'products', 3, 1);
    });

    it('should filter metrics by operation', () => {
      const operation1Metrics = logger.getPerformanceMetrics('operation1');
      expect(operation1Metrics).toHaveLength(2);
      expect(operation1Metrics.every((metric) => metric.operation === 'operation1')).toBe(true);
    });

    it('should limit metric results', () => {
      const limitedMetrics = logger.getPerformanceMetrics(undefined, 2);
      expect(limitedMetrics).toHaveLength(2);
    });
  });

  describe('Log Management', () => {
    it('should clear logs', () => {
      logger.info('TEST', 'test', 'message');
      expect(logger.getLogs()).toHaveLength(1);

      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should clear performance metrics', () => {
      logger.endOperation('op1', 'test', 10);
      expect(logger.getPerformanceMetrics()).toHaveLength(1);

      logger.clearPerformanceMetrics();
      expect(logger.getPerformanceMetrics()).toHaveLength(0);
    });

    it('should export logs as JSON', () => {
      logger.clearLogs();
      logger.clearPerformanceMetrics();

      logger.info('TEST', 'test', 'message');
      logger.endOperation('op1', 'test', 10);

      const exportData = logger.exportLogs();
      const parsed = JSON.parse(exportData);

      expect(parsed.logs).toHaveLength(2); // 1 info log + 1 performance log
      expect(parsed.performanceMetrics).toHaveLength(1);
      expect(parsed.exportTimestamp).toBeDefined();
    });
  });

  describe('Log Retention', () => {
    it('should limit log entries to maxLogs', () => {
      // Create more logs than the max limit (1000)
      for (let i = 0; i < 1005; i++) {
        logger.info('TEST', 'test', `message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1000); // Should be limited to maxLogs
      expect(logs[0].message).toBe('message 5'); // Should keep the latest logs
    });

    it('should limit performance metrics to maxMetrics', () => {
      // Clear existing metrics first
      logger.clearPerformanceMetrics();

      // Create more metrics than the max limit (500)
      for (let i = 0; i < 505; i++) {
        logger.endOperation(`op${i}`, `test${i}`, 10);
      }

      const metrics = logger.getPerformanceMetrics();
      expect(metrics).toHaveLength(500); // Should be limited to maxMetrics
      expect(metrics[0].operation).toBe('test5'); // Should keep the latest metrics
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain singleton instance', () => {
      const logger1 = logger;
      const logger2 = logger;

      expect(logger1).toBe(logger2);
    });
  });
});

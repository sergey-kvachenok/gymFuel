export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  operation: string;
  message: string;
  data?: unknown;
  duration?: number;
  error?: Error;
  userId?: number;
  tableName?: string;
  recordId?: number;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  tableName?: string;
  recordCount?: number;
  userId?: number;
}

class Logger {
  private static instance: Logger | null = null;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  private maxMetrics = 500; // Keep last 500 performance metrics

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    operation: string,
    message: string,
    data?: unknown,
    duration?: number,
    error?: Error,
    userId?: number,
    tableName?: string,
    recordId?: number,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      operation,
      message,
      data,
      duration,
      error,
      userId,
      tableName,
      recordId,
    };
  }

  private addLog(entry: LogEntry): void {
    if (this.shouldLog(entry.level)) {
      this.logs.push(entry);

      // Keep only the last maxLogs entries
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }

      // Console output based on log level
      const logMethod = this.getConsoleMethod(entry.level);
      const prefix = `[${entry.timestamp}] [${entry.category}] [${entry.operation}]`;

      if (entry.error) {
        logMethod(`${prefix} ${entry.message}`, entry.error, entry.data);
      } else if (entry.duration !== undefined) {
        logMethod(`${prefix} ${entry.message} (${entry.duration}ms)`, entry.data);
      } else {
        logMethod(`${prefix} ${entry.message}`, entry.data);
      }
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  private addPerformanceMetric(metric: PerformanceMetrics): void {
    this.performanceMetrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetrics);
    }
  }

  // Public logging methods
  debug(
    category: string,
    operation: string,
    message: string,
    data?: unknown,
    userId?: number,
    tableName?: string,
    recordId?: number,
  ): void {
    this.addLog(
      this.createLogEntry(
        LogLevel.DEBUG,
        category,
        operation,
        message,
        data,
        undefined,
        undefined,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  info(
    category: string,
    operation: string,
    message: string,
    data?: unknown,
    userId?: number,
    tableName?: string,
    recordId?: number,
  ): void {
    this.addLog(
      this.createLogEntry(
        LogLevel.INFO,
        category,
        operation,
        message,
        data,
        undefined,
        undefined,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  warn(
    category: string,
    operation: string,
    message: string,
    data?: unknown,
    userId?: number,
    tableName?: string,
    recordId?: number,
  ): void {
    this.addLog(
      this.createLogEntry(
        LogLevel.WARN,
        category,
        operation,
        message,
        data,
        undefined,
        undefined,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  error(
    category: string,
    operation: string,
    message: string,
    error?: Error,
    data?: unknown,
    userId?: number,
    tableName?: string,
    recordId?: number,
  ): void {
    this.addLog(
      this.createLogEntry(
        LogLevel.ERROR,
        category,
        operation,
        message,
        data,
        undefined,
        error,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  // Performance tracking
  startOperation(operation: string, tableName?: string, userId?: number): string {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.debug(
      'PERFORMANCE',
      operation,
      `Starting operation: ${operationId}`,
      { tableName, userId },
      userId,
      tableName,
    );

    return operationId;
  }

  endOperation(
    operationId: string,
    operation: string,
    duration: number,
    tableName?: string,
    userId?: number,
    recordCount?: number,
  ): void {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      tableName,
      recordCount,
      userId,
    };

    this.addPerformanceMetric(metric);

    this.info(
      'PERFORMANCE',
      operation,
      `Completed operation: ${operationId}`,
      { duration, recordCount },
      userId,
      tableName,
      undefined,
    );
  }

  // Database operation specific logging
  logDbOperation(
    operation: string,
    tableName: string,
    message: string,
    data?: unknown,
    userId?: number,
    recordId?: number,
    duration?: number,
    error?: Error,
  ): void {
    const level = error ? LogLevel.ERROR : LogLevel.INFO;
    this.addLog(
      this.createLogEntry(
        level,
        'DATABASE',
        operation,
        message,
        data,
        duration,
        error,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  // Sync operation specific logging
  logSyncOperation(
    operation: string,
    message: string,
    data?: unknown,
    userId?: number,
    tableName?: string,
    recordId?: number,
    error?: Error,
  ): void {
    const level = error ? LogLevel.ERROR : LogLevel.INFO;
    this.addLog(
      this.createLogEntry(
        level,
        'SYNC',
        operation,
        message,
        data,
        undefined,
        error,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  // Error operation specific logging
  logErrorOperation(
    operation: string,
    message: string,
    error: Error,
    data?: unknown,
    userId?: number,
    tableName?: string,
    recordId?: number,
  ): void {
    this.addLog(
      this.createLogEntry(
        LogLevel.ERROR,
        'ERROR',
        operation,
        message,
        data,
        undefined,
        error,
        userId,
        tableName,
        recordId,
      ),
    );
  }

  // Utility methods
  getLogs(level?: LogLevel, category?: string, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.level >= level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter((log) => log.category === category);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  getPerformanceMetrics(operation?: string, limit?: number): PerformanceMetrics[] {
    let filteredMetrics = this.performanceMetrics;

    if (operation) {
      filteredMetrics = filteredMetrics.filter((metric) => metric.operation === operation);
    }

    if (limit) {
      filteredMetrics = filteredMetrics.slice(-limit);
    }

    return filteredMetrics;
  }

  getAveragePerformance(operation: string): number {
    const metrics = this.getPerformanceMetrics(operation);
    if (metrics.length === 0) return 0;

    const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / metrics.length;
  }

  clearLogs(): void {
    this.logs = [];
  }

  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }

  exportLogs(): string {
    return JSON.stringify(
      {
        logs: this.logs,
        performanceMetrics: this.performanceMetrics,
        exportTimestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }
}

export const logger = Logger.getInstance();

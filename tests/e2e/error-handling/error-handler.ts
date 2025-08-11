import { Page, TestInfo } from '@playwright/test';
import { configManager } from '../config/environment-config';

/**
 * Error types for different test scenarios
 */
export enum ErrorType {
  NAVIGATION = 'navigation',
  ELEMENT_NOT_FOUND = 'element_not_found',
  TIMEOUT = 'timeout',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

/**
 * Error context information
 */
export interface ErrorContext {
  testName: string;
  step: string;
  url: string;
  timestamp: Date;
  errorType: ErrorType;
  originalError: Error;
  screenshotPath?: string;
  pageState?: {
    title: string;
    url: string;
    content?: string;
  };
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

/**
 * Comprehensive error handling and reporting system
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorContext[] = [];
  private retryConfig: RetryConfig;

  private constructor() {
    this.retryConfig = {
      maxAttempts: configManager.get('RETRY_ATTEMPTS'),
      delayMs: 1000,
      backoffMultiplier: 2,
      retryableErrors: [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.ELEMENT_NOT_FOUND],
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle error with retry mechanism
   */
  public async handleError(
    page: Page,
    testInfo: TestInfo,
    error: Error,
    context: Partial<ErrorContext>,
  ): Promise<void> {
    const errorType = this.classifyError(error);
    const errorContext: ErrorContext = {
      testName: testInfo.title,
      step: context.step || 'unknown',
      url: await page.url(),
      timestamp: new Date(),
      errorType,
      originalError: error,
      pageState: await this.capturePageState(page),
    };

    // Take screenshot on error
    if (configManager.get('SCREENSHOT_ON_FAILURE')) {
      errorContext.screenshotPath = await this.takeErrorScreenshot(page, testInfo, errorType);
    }

    // Log the error
    this.logError(errorContext);

    // Check if error is retryable
    if (this.isRetryableError(errorType)) {
      throw new RetryableError(errorContext);
    }

    // For non-retryable errors, throw with enhanced context
    throw new EnhancedError(errorContext);
  }

  /**
   * Execute operation with retry mechanism
   */
  public async withRetry<T>(
    page: Page,
    testInfo: TestInfo,
    operation: () => Promise<T>,
    context: Partial<ErrorContext> = {},
  ): Promise<T> {
    let lastError: Error;
    let delay = this.retryConfig.delayMs;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.retryConfig.maxAttempts) {
          // Final attempt failed, handle the error
          await this.handleError(page, testInfo, lastError, {
            ...context,
            step: `${context.step || 'operation'} (attempt ${attempt}/${this.retryConfig.maxAttempts})`,
          });
        }

        // Wait before retry
        if (attempt < this.retryConfig.maxAttempts) {
          console.log(
            `⚠️ Retry attempt ${attempt}/${this.retryConfig.maxAttempts} after ${delay}ms`,
          );
          await page.waitForTimeout(delay);
          delay *= this.retryConfig.backoffMultiplier;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Classify error type based on error message and context
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorType.TIMEOUT;
    }

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }

    if (message.includes('element') || message.includes('selector')) {
      return ErrorType.ELEMENT_NOT_FOUND;
    }

    if (message.includes('navigation') || message.includes('url')) {
      return ErrorType.NAVIGATION;
    }

    if (message.includes('auth') || message.includes('login')) {
      return ErrorType.AUTHENTICATION;
    }

    if (message.includes('database') || message.includes('db')) {
      return ErrorType.DATABASE;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(errorType: ErrorType): boolean {
    return this.retryConfig.retryableErrors.includes(errorType);
  }

  /**
   * Take screenshot on error
   */
  private async takeErrorScreenshot(
    page: Page,
    testInfo: TestInfo,
    errorType: ErrorType,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error-${errorType}-${testInfo.title.replace(/\s+/g, '-')}-${timestamp}.png`;
    const path = `test-results/error-screenshots/${filename}`;

    try {
      await page.screenshot({
        path,
        fullPage: true,
      });
      console.log(`📸 Error screenshot saved: ${path}`);
      return path;
    } catch (screenshotError) {
      console.error('❌ Failed to take error screenshot:', screenshotError);
      return '';
    }
  }

  /**
   * Capture current page state
   */
  private async capturePageState(page: Page): Promise<ErrorContext['pageState']> {
    try {
      return {
        title: await page.title(),
        url: page.url(),
        content: await page.content().catch(() => 'Unable to capture content'),
      };
    } catch (error) {
      return {
        title: 'Unknown',
        url: 'Unknown',
        content: 'Unable to capture page state',
      };
    }
  }

  /**
   * Log error with detailed information
   */
  private logError(errorContext: ErrorContext): void {
    this.errorLog.push(errorContext);

    console.error('\n❌ ERROR DETAILS:');
    console.error(`Test: ${errorContext.testName}`);
    console.error(`Step: ${errorContext.step}`);
    console.error(`Type: ${errorContext.errorType}`);
    console.error(`URL: ${errorContext.url}`);
    console.error(`Time: ${errorContext.timestamp.toISOString()}`);
    console.error(`Message: ${errorContext.originalError.message}`);

    if (errorContext.screenshotPath) {
      console.error(`Screenshot: ${errorContext.screenshotPath}`);
    }

    console.error('');
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsByTest: Record<string, number>;
  } {
    const errorsByType: Record<ErrorType, number> = {} as any;
    const errorsByTest: Record<string, number> = {};

    for (const error of this.errorLog) {
      // Count by type
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;

      // Count by test
      errorsByTest[error.testName] = (errorsByTest[error.testName] || 0) + 1;
    }

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsByTest,
    };
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Generate error report
   */
  public generateErrorReport(): string {
    const stats = this.getErrorStats();

    let report = '\n📊 ERROR REPORT\n';
    report += '='.repeat(50) + '\n';
    report += `Total Errors: ${stats.totalErrors}\n\n`;

    report += 'Errors by Type:\n';
    for (const [type, count] of Object.entries(stats.errorsByType)) {
      report += `  ${type}: ${count}\n`;
    }

    report += '\nErrors by Test:\n';
    for (const [test, count] of Object.entries(stats.errorsByTest)) {
      report += `  ${test}: ${count}\n`;
    }

    report += '\nRecent Errors:\n';
    const recentErrors = this.errorLog.slice(-5);
    for (const error of recentErrors) {
      report += `  ${error.timestamp.toISOString()} - ${error.testName}: ${error.originalError.message}\n`;
    }

    return report;
  }
}

/**
 * Custom error classes for better error handling
 */
export class RetryableError extends Error {
  public readonly errorContext: ErrorContext;

  constructor(errorContext: ErrorContext) {
    super(`Retryable error: ${errorContext.originalError.message}`);
    this.name = 'RetryableError';
    this.errorContext = errorContext;
  }
}

export class EnhancedError extends Error {
  public readonly errorContext: ErrorContext;

  constructor(errorContext: ErrorContext) {
    super(`Enhanced error: ${errorContext.originalError.message}`);
    this.name = 'EnhancedError';
    this.errorContext = errorContext;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const handleError = (
  page: Page,
  testInfo: TestInfo,
  error: Error,
  context?: Partial<ErrorContext>,
) => errorHandler.handleError(page, testInfo, error, context || {});

export const withRetry = <T>(
  page: Page,
  testInfo: TestInfo,
  operation: () => Promise<T>,
  context?: Partial<ErrorContext>,
) => errorHandler.withRetry(page, testInfo, operation, context);

export const getErrorStats = () => errorHandler.getErrorStats();
export const generateErrorReport = () => errorHandler.generateErrorReport();
export const clearErrorLog = () => errorHandler.clearErrorLog();

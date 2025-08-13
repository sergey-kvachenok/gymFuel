/**
 * Test Timeout Manager
 *
 * This module provides timeout management for Playwright tests to prevent
 * tests from getting stuck indefinitely. QA agents can use this to
 * automatically stop processes that exceed reasonable time limits.
 */

import { Page } from '@playwright/test';

export interface TimeoutConfig {
  /** Maximum time for a single test in milliseconds */
  maxTestTime: number;
  /** Maximum time for navigation operations */
  maxNavigationTime: number;
  /** Maximum time for network idle waits */
  maxNetworkIdleTime: number;
  /** Maximum time for element interactions */
  maxInteractionTime: number;
}

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  maxTestTime: 60000, // 1 minute
  maxNavigationTime: 30000, // 30 seconds
  maxNetworkIdleTime: 10000, // 10 seconds
  maxInteractionTime: 15000, // 15 seconds
};

/**
 * Timeout Manager Class
 * Provides timeout management and automatic cleanup for Playwright tests
 */
export class TestTimeoutManager {
  private config: TimeoutConfig;
  private testStartTime: number;
  private timeouts: NodeJS.Timeout[] = [];

  constructor(config: Partial<TimeoutConfig> = {}) {
    this.config = { ...DEFAULT_TIMEOUT_CONFIG, ...config };
    this.testStartTime = Date.now();
  }

  /**
   * Start a test with automatic timeout
   */
  startTest(testName: string): void {
    console.log(`🧪 Starting test: ${testName}`);
    this.testStartTime = Date.now();

    // Set up automatic timeout for the entire test
    const timeout = setTimeout(() => {
      console.error(`⏰ Test timeout exceeded (${this.config.maxTestTime}ms): ${testName}`);
      this.forceStopTest();
    }, this.config.maxTestTime);

    this.timeouts.push(timeout);
  }

  /**
   * Wait for navigation with timeout
   */
  async waitForNavigation(page: Page, timeout?: number): Promise<void> {
    const navigationTimeout = timeout || this.config.maxNavigationTime;

    try {
      await page.waitForLoadState('networkidle', { timeout: navigationTimeout });
    } catch (error) {
      console.error(`⏰ Navigation timeout exceeded (${navigationTimeout}ms)`);
      throw new Error(`Navigation timeout: ${error}`);
    }
  }

  /**
   * Wait for network idle with timeout
   */
  async waitForNetworkIdle(page: Page, timeout?: number): Promise<void> {
    const networkTimeout = timeout || this.config.maxNetworkIdleTime;

    try {
      await page.waitForLoadState('networkidle', { timeout: networkTimeout });
    } catch (error) {
      console.error(`⏰ Network idle timeout exceeded (${networkTimeout}ms)`);
      throw new Error(`Network idle timeout: ${error}`);
    }
  }

  /**
   * Wait for element with timeout
   */
  async waitForElement(page: Page, selector: string, timeout?: number): Promise<void> {
    const elementTimeout = timeout || this.config.maxInteractionTime;

    try {
      await page.waitForSelector(selector, { timeout: elementTimeout });
    } catch (error) {
      console.error(`⏰ Element wait timeout exceeded (${elementTimeout}ms): ${selector}`);
      throw new Error(`Element wait timeout: ${error}`);
    }
  }

  /**
   * Force stop the current test
   */
  forceStopTest(): void {
    console.error('🛑 Force stopping test due to timeout');

    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];

    // Force process exit if needed (use with caution)
    if (process.env.FORCE_EXIT_ON_TIMEOUT === 'true') {
      console.error('🛑 Force exiting process due to timeout');
      process.exit(1);
    }
  }

  /**
   * Clean up timeouts
   */
  cleanup(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];
  }

  /**
   * Get test duration
   */
  getTestDuration(): number {
    return Date.now() - this.testStartTime;
  }

  /**
   * Check if test is taking too long
   */
  isTestTakingTooLong(): boolean {
    return this.getTestDuration() > this.config.maxTestTime * 0.8; // 80% of max time
  }
}

/**
 * Global timeout manager instance
 */
export const globalTimeoutManager = new TestTimeoutManager();

/**
 * Decorator for test functions to add automatic timeout
 */
export function withTimeout(timeoutMs: number = 60000) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const timeoutManager = new TestTimeoutManager({ maxTestTime: timeoutMs });

      try {
        timeoutManager.startTest(propertyName);
        const result = await method.apply(this, args);
        timeoutManager.cleanup();
        return result;
      } catch (error) {
        timeoutManager.cleanup();
        throw error;
      }
    };
  };
}

/**
 * Utility function to run a test with timeout
 */
export async function runTestWithTimeout<T>(
  testName: string,
  testFn: () => Promise<T>,
  timeoutMs: number = 60000,
): Promise<T> {
  const timeoutManager = new TestTimeoutManager({ maxTestTime: timeoutMs });

  try {
    timeoutManager.startTest(testName);
    const result = await testFn();
    timeoutManager.cleanup();
    return result;
  } catch (error) {
    timeoutManager.cleanup();
    throw error;
  }
}

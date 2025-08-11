import { test, expect, Page, TestInfo, BrowserContext } from '@playwright/test';
import {
  errorHandler,
  withRetry,
  getErrorStats,
  generateErrorReport,
} from './error-handling/error-handler';
import {
  performanceOptimizer,
  startMonitoring,
  endMonitoring,
  getPerformanceStats,
  generatePerformanceReport,
} from './performance/performance-optimizer';
import {
  coverageReporter,
  markCovered,
  getCoverageStats,
  generateCoverageReport,
} from './coverage/coverage-reporter';
import {
  accessibilityTester,
  testKeyboardNavigation,
  testFocusManagement,
  testScreenReaderCompatibility,
  generateAccessibilityReport,
} from './accessibility/accessibility-tester';
import {
  mobileTester,
  testResponsiveDesign,
  testTouchInteractions,
  testMobileFunctionality,
  generateMobileReport,
} from './mobile/mobile-tester';
import { testDataManager, createTestData, cleanupTestData } from './test-data-manager';
import { configManager } from './config/environment-config';

/**
 * Comprehensive test runner configuration
 */
export interface ComprehensiveTestConfig {
  enableErrorHandling: boolean;
  enablePerformanceMonitoring: boolean;
  enableCoverageReporting: boolean;
  enableAccessibilityTesting: boolean;
  enableMobileTesting: boolean;
  enableTestDataManagement: boolean;
  retryAttempts: number;
  screenshotOnFailure: boolean;
  generateReports: boolean;
}

/**
 * Test execution context
 */
export interface TestExecutionContext {
  testName: string;
  testInfo: TestInfo;
  page: Page;
  context: BrowserContext;
  startTime: Date;
  performanceMetrics?: any;
  coverageItems: string[];
  errorContext?: any;
}

/**
 * Comprehensive test runner for e2e tests
 */
export class ComprehensiveTestRunner {
  private static instance: ComprehensiveTestRunner;
  private config: ComprehensiveTestConfig;
  private executionContexts: Map<string, TestExecutionContext> = new Map();

  private constructor() {
    this.config = {
      enableErrorHandling: true,
      enablePerformanceMonitoring: true,
      enableCoverageReporting: true,
      enableAccessibilityTesting: true,
      enableMobileTesting: true,
      enableTestDataManagement: true,
      retryAttempts: configManager.get('RETRY_ATTEMPTS'),
      screenshotOnFailure: configManager.get('SCREENSHOT_ON_FAILURE'),
      generateReports: true,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ComprehensiveTestRunner {
    if (!ComprehensiveTestRunner.instance) {
      ComprehensiveTestRunner.instance = new ComprehensiveTestRunner();
    }
    return ComprehensiveTestRunner.instance;
  }

  /**
   * Configure the test runner
   */
  public configure(config: Partial<ComprehensiveTestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start test execution
   */
  public async startTest(
    testName: string,
    testInfo: TestInfo,
    page: Page,
    context: BrowserContext,
  ): Promise<TestExecutionContext> {
    const executionContext: TestExecutionContext = {
      testName,
      testInfo,
      page,
      context,
      startTime: new Date(),
      coverageItems: [],
    };

    this.executionContexts.set(testName, executionContext);

    console.log(`🚀 Starting comprehensive test: ${testName}`);

    // Start performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      executionContext.performanceMetrics = startMonitoring(testName);
    }

    // Optimize page for performance
    if (this.config.enablePerformanceMonitoring) {
      await performanceOptimizer.optimizePage(page);
    }

    // Create test data if enabled
    if (this.config.enableTestDataManagement) {
      const testData = createTestData(testName, {
        users: 1,
        products: 2,
        consumptions: 3,
        goals: 1,
      });
      console.log(`📊 Created test data for: ${testName}`);
    }

    return executionContext;
  }

  /**
   * End test execution
   */
  public async endTest(testName: string, passed: boolean = true): Promise<void> {
    const executionContext = this.executionContexts.get(testName);
    if (!executionContext) {
      console.warn(`⚠️ No execution context found for test: ${testName}`);
      return;
    }

    console.log(`🏁 Ending comprehensive test: ${testName} (${passed ? 'PASSED' : 'FAILED'})`);

    try {
      // End performance monitoring
      if (this.config.enablePerformanceMonitoring && executionContext.performanceMetrics) {
        endMonitoring(testName, executionContext.page);
      }

      // Mark coverage items as covered
      if (this.config.enableCoverageReporting && executionContext.coverageItems.length > 0) {
        markCovered(executionContext.coverageItems, testName);
      }

      // Clean up test data
      if (this.config.enableTestDataManagement) {
        await cleanupTestData(testName, executionContext.page);
      }

      // Take screenshot on failure
      if (!passed && this.config.screenshotOnFailure) {
        await executionContext.page.screenshot({
          path: `test-results/failure-${testName}-${Date.now()}.png`,
          fullPage: true,
        });
      }
    } catch (error) {
      console.error(`❌ Error ending test ${testName}:`, error);
    } finally {
      this.executionContexts.delete(testName);
    }
  }

  /**
   * Execute test with comprehensive monitoring
   */
  public async executeTest<T>(
    testName: string,
    testInfo: TestInfo,
    page: Page,
    context: BrowserContext,
    testFunction: () => Promise<T>,
    coverageItems: string[] = [],
  ): Promise<T> {
    const executionContext = await this.startTest(testName, testInfo, page, context);
    executionContext.coverageItems = coverageItems;

    try {
      let result: T;

      // Execute with retry mechanism if error handling is enabled
      if (this.config.enableErrorHandling) {
        result = await withRetry(page, testInfo, testFunction, {
          step: testName,
        });
      } else {
        result = await testFunction();
      }

      await this.endTest(testName, true);
      return result;
    } catch (error) {
      await this.endTest(testName, false);
      throw error;
    }
  }

  /**
   * Run accessibility tests
   */
  public async runAccessibilityTests(page: Page, testName: string): Promise<void> {
    if (!this.config.enableAccessibilityTesting) return;

    console.log(`♿ Running accessibility tests for: ${testName}`);

    try {
      // Test keyboard navigation
      await testKeyboardNavigation(page, testName);

      // Test focus management
      await testFocusManagement(page, testName);

      // Test screen reader compatibility
      await testScreenReaderCompatibility(page, testName);
    } catch (error) {
      console.error(`❌ Accessibility tests failed for ${testName}:`, error);
    }
  }

  /**
   * Run mobile tests
   */
  public async runMobileTests(page: Page, testName: string): Promise<void> {
    if (!this.config.enableMobileTesting) return;

    console.log(`📱 Running mobile tests for: ${testName}`);

    try {
      const devices = mobileTester.getDevices();

      // Test with first device (iPhone 12)
      const device = devices[0];

      // Test responsive design
      await testResponsiveDesign(page, device);

      // Test touch interactions
      await testTouchInteractions(page, device);

      // Test mobile functionality
      await testMobileFunctionality(page, device);
    } catch (error) {
      console.error(`❌ Mobile tests failed for ${testName}:`, error);
    }
  }

  /**
   * Generate comprehensive reports
   */
  public async generateComprehensiveReports(): Promise<string> {
    if (!this.config.generateReports) return '';

    console.log('📊 Generating comprehensive reports...');

    let report = '\n🎯 COMPREHENSIVE TEST SUITE REPORT\n';
    report += '='.repeat(60) + '\n\n';

    // Error handling report
    if (this.config.enableErrorHandling) {
      report += generateErrorReport();
      report += '\n';
    }

    // Performance report
    if (this.config.enablePerformanceMonitoring) {
      report += generatePerformanceReport();
      report += '\n';
    }

    // Coverage report
    if (this.config.enableCoverageReporting) {
      report += generateCoverageReport();
      report += '\n';
    }

    // Accessibility report
    if (this.config.enableAccessibilityTesting) {
      report += generateAccessibilityReport();
      report += '\n';
    }

    // Mobile testing report
    if (this.config.enableMobileTesting) {
      report += generateMobileReport();
      report += '\n';
    }

    // Test data management report
    if (this.config.enableTestDataManagement) {
      const testDataStats = testDataManager.getTestDataStats();
      report += '\n📋 TEST DATA MANAGEMENT REPORT\n';
      report += '='.repeat(50) + '\n';
      report += `Total Tests: ${testDataStats.totalTests}\n`;
      report += `Total Products: ${testDataStats.totalProducts}\n`;
      report += `Total Consumptions: ${testDataStats.totalConsumptions}\n`;
      report += `Total Goals: ${testDataStats.totalGoals}\n`;
      report += `Cache Size: ${testDataStats.cacheSize}\n\n`;
    }

    // Summary
    report += this.generateSummary();

    return report;
  }

  /**
   * Generate test summary
   */
  private generateSummary(): string {
    let summary = '\n📈 TEST SUITE SUMMARY\n';
    summary += '='.repeat(50) + '\n';

    // Error statistics
    if (this.config.enableErrorHandling) {
      const errorStats = getErrorStats();
      summary += `Errors: ${errorStats.totalErrors}\n`;
    }

    // Performance statistics
    if (this.config.enablePerformanceMonitoring) {
      const perfStats = getPerformanceStats();
      summary += `Average Test Duration: ${Math.round(perfStats.averageDuration)}ms\n`;
      summary += `Total Network Requests: ${perfStats.totalNetworkRequests}\n`;
    }

    // Coverage statistics
    if (this.config.enableCoverageReporting) {
      const coverageStats = getCoverageStats();
      summary += `Test Coverage: ${coverageStats.coveragePercentage.toFixed(1)}%\n`;
      summary += `Uncovered Items: ${coverageStats.uncoveredItems.length}\n`;
    }

    // Test data statistics
    if (this.config.enableTestDataManagement) {
      const testDataStats = testDataManager.getTestDataStats();
      summary += `Test Data Created: ${testDataStats.totalProducts + testDataStats.totalConsumptions + testDataStats.totalGoals}\n`;
    }

    summary += '\n🎉 All systems operational!\n';

    return summary;
  }

  /**
   * Reset all systems
   */
  public async resetAllSystems(): Promise<void> {
    console.log('🔄 Resetting all test systems...');

    // Clear error logs
    if (this.config.enableErrorHandling) {
      errorHandler.clearErrorLog();
    }

    // Reset performance metrics
    if (this.config.enablePerformanceMonitoring) {
      performanceOptimizer.resetMetrics();
    }

    // Reset coverage data
    if (this.config.enableCoverageReporting) {
      coverageReporter.resetCoverage();
    }

    // Clear accessibility results
    if (this.config.enableAccessibilityTesting) {
      accessibilityTester.clearResults();
    }

    // Clear mobile results
    if (this.config.enableMobileTesting) {
      mobileTester.clearResults();
    }

    // Reset test data manager
    if (this.config.enableTestDataManagement) {
      testDataManager.reset();
    }

    // Clear execution contexts
    this.executionContexts.clear();

    console.log('✅ All systems reset successfully');
  }

  /**
   * Get current configuration
   */
  public getConfig(): ComprehensiveTestConfig {
    return { ...this.config };
  }

  /**
   * Get active execution contexts
   */
  public getActiveContexts(): TestExecutionContext[] {
    return Array.from(this.executionContexts.values());
  }
}

// Export singleton instance
export const comprehensiveTestRunner = ComprehensiveTestRunner.getInstance();

// Export convenience functions
export const startComprehensiveTest = (
  testName: string,
  testInfo: TestInfo,
  page: Page,
  context: BrowserContext,
) => comprehensiveTestRunner.startTest(testName, testInfo, page, context);

export const endComprehensiveTest = (testName: string, passed?: boolean) =>
  comprehensiveTestRunner.endTest(testName, passed);

export const executeComprehensiveTest = <T>(
  testName: string,
  testInfo: TestInfo,
  page: Page,
  context: BrowserContext,
  testFunction: () => Promise<T>,
  coverageItems?: string[],
) =>
  comprehensiveTestRunner.executeTest(
    testName,
    testInfo,
    page,
    context,
    testFunction,
    coverageItems || [],
  );

export const runAccessibilityTests = (page: Page, testName: string) =>
  comprehensiveTestRunner.runAccessibilityTests(page, testName);

export const runMobileTests = (page: Page, testName: string) =>
  comprehensiveTestRunner.runMobileTests(page, testName);

export const generateComprehensiveReports = () =>
  comprehensiveTestRunner.generateComprehensiveReports();

export const resetAllSystems = () => comprehensiveTestRunner.resetAllSystems();

export const configureComprehensiveRunner = (config: Partial<ComprehensiveTestConfig>) =>
  comprehensiveTestRunner.configure(config);

// Export test decorators for easy use
export const withComprehensiveTesting = (
  testFunction: (page: Page, testInfo: TestInfo) => Promise<void>,
  coverageItems: string[] = [],
) => {
  return async (page: Page, testInfo: TestInfo) => {
    await executeComprehensiveTest(
      testInfo.title,
      testInfo,
      page,
      page.context(),
      () => testFunction(page, testInfo),
      coverageItems,
    );
  };
};

export const withAccessibilityTesting = (
  testFunction: (page: Page, testInfo: TestInfo) => Promise<void>,
) => {
  return async (page: Page, testInfo: TestInfo) => {
    await testFunction(page, testInfo);
    await runAccessibilityTests(page, testInfo.title);
  };
};

export const withMobileTesting = (
  testFunction: (page: Page, testInfo: TestInfo) => Promise<void>,
) => {
  return async (page: Page, testInfo: TestInfo) => {
    await testFunction(page, testInfo);
    await runMobileTests(page, testInfo.title);
  };
};

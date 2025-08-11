import { TestInfo } from '@playwright/test';

/**
 * Coverage categories
 */
export enum CoverageCategory {
  AUTHENTICATION = 'authentication',
  DASHBOARD = 'dashboard',
  GOALS = 'goals',
  HISTORY = 'history',
  NAVIGATION = 'navigation',
  PRODUCTS = 'products',
  CONSUMPTION = 'consumption',
  VALIDATION = 'validation',
  ERROR_HANDLING = 'error_handling',
  ACCESSIBILITY = 'accessibility',
  PERFORMANCE = 'performance',
}

/**
 * Test coverage item
 */
export interface CoverageItem {
  id: string;
  category: CoverageCategory;
  description: string;
  testName: string;
  covered: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

/**
 * Coverage statistics
 */
export interface CoverageStats {
  totalItems: number;
  coveredItems: number;
  coveragePercentage: number;
  coverageByCategory: Record<
    CoverageCategory,
    { total: number; covered: number; percentage: number }
  >;
  uncoveredItems: CoverageItem[];
  highPriorityUncovered: CoverageItem[];
}

/**
 * Test coverage reporting system
 */
export class CoverageReporter {
  private static instance: CoverageReporter;
  private coverageItems: CoverageItem[] = [];
  private testCoverage: Map<string, string[]> = new Map(); // testName -> coverageItemIds

  private constructor() {
    this.initializeCoverageItems();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CoverageReporter {
    if (!CoverageReporter.instance) {
      CoverageReporter.instance = new CoverageReporter();
    }
    return CoverageReporter.instance;
  }

  /**
   * Initialize coverage items based on application features
   */
  private initializeCoverageItems(): void {
    this.coverageItems = [
      // Authentication
      {
        id: 'auth-register',
        category: CoverageCategory.AUTHENTICATION,
        description: 'User registration',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'auth-login',
        category: CoverageCategory.AUTHENTICATION,
        description: 'User login',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'auth-logout',
        category: CoverageCategory.AUTHENTICATION,
        description: 'User logout',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'auth-session',
        category: CoverageCategory.AUTHENTICATION,
        description: 'Session persistence',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'auth-invalid',
        category: CoverageCategory.AUTHENTICATION,
        description: 'Invalid credentials',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Dashboard
      {
        id: 'dashboard-display',
        category: CoverageCategory.DASHBOARD,
        description: 'Dashboard display',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'dashboard-stats',
        category: CoverageCategory.DASHBOARD,
        description: 'Daily statistics',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'dashboard-goals-progress',
        category: CoverageCategory.DASHBOARD,
        description: 'Goals progress display',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'dashboard-meals',
        category: CoverageCategory.DASHBOARD,
        description: "Today's meals list",
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'dashboard-empty',
        category: CoverageCategory.DASHBOARD,
        description: 'Empty state handling',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Goals
      {
        id: 'goals-display',
        category: CoverageCategory.GOALS,
        description: 'Goals page display',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'goals-set',
        category: CoverageCategory.GOALS,
        description: 'Set nutrition goals',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'goals-validate',
        category: CoverageCategory.GOALS,
        description: 'Goal form validation',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'goals-persist',
        category: CoverageCategory.GOALS,
        description: 'Goals persistence',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'goals-change-type',
        category: CoverageCategory.GOALS,
        description: 'Change goal type',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'goals-recommendations',
        category: CoverageCategory.GOALS,
        description: 'Goal recommendations',
        testName: '',
        covered: false,
        priority: 'low',
      },

      // History
      {
        id: 'history-display',
        category: CoverageCategory.HISTORY,
        description: 'History page display',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'history-entries',
        category: CoverageCategory.HISTORY,
        description: 'Consumption entries',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'history-filter-date',
        category: CoverageCategory.HISTORY,
        description: 'Date range filtering',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'history-filter-product',
        category: CoverageCategory.HISTORY,
        description: 'Product filtering',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'history-details',
        category: CoverageCategory.HISTORY,
        description: 'Consumption details',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'history-sort',
        category: CoverageCategory.HISTORY,
        description: 'Sorting functionality',
        testName: '',
        covered: false,
        priority: 'low',
      },
      {
        id: 'history-totals',
        category: CoverageCategory.HISTORY,
        description: 'Nutrition totals',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'history-empty',
        category: CoverageCategory.HISTORY,
        description: 'Empty history state',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Navigation
      {
        id: 'nav-between-sections',
        category: CoverageCategory.NAVIGATION,
        description: 'Navigate between sections',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'nav-active-state',
        category: CoverageCategory.NAVIGATION,
        description: 'Active navigation state',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'nav-direct-url',
        category: CoverageCategory.NAVIGATION,
        description: 'Direct URL navigation',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'nav-session-persistence',
        category: CoverageCategory.NAVIGATION,
        description: 'Session persistence across navigation',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'nav-browser-back-forward',
        category: CoverageCategory.NAVIGATION,
        description: 'Browser back/forward',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'nav-page-refresh',
        category: CoverageCategory.NAVIGATION,
        description: 'Page refresh handling',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'nav-invalid-routes',
        category: CoverageCategory.NAVIGATION,
        description: 'Invalid route handling',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'nav-loading-states',
        category: CoverageCategory.NAVIGATION,
        description: 'Loading states during navigation',
        testName: '',
        covered: false,
        priority: 'low',
      },

      // Products
      {
        id: 'products-add',
        category: CoverageCategory.PRODUCTS,
        description: 'Add new products',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'products-edit',
        category: CoverageCategory.PRODUCTS,
        description: 'Edit products',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'products-delete',
        category: CoverageCategory.PRODUCTS,
        description: 'Delete products',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'products-search',
        category: CoverageCategory.PRODUCTS,
        description: 'Product search',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'products-validation',
        category: CoverageCategory.PRODUCTS,
        description: 'Product form validation',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Consumption
      {
        id: 'consumption-add',
        category: CoverageCategory.CONSUMPTION,
        description: 'Add consumption entries',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'consumption-edit',
        category: CoverageCategory.CONSUMPTION,
        description: 'Edit consumption entries',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'consumption-delete',
        category: CoverageCategory.CONSUMPTION,
        description: 'Delete consumption entries',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'consumption-stats-update',
        category: CoverageCategory.CONSUMPTION,
        description: 'Statistics update on consumption',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'consumption-validation',
        category: CoverageCategory.CONSUMPTION,
        description: 'Consumption form validation',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Validation
      {
        id: 'validation-form-inputs',
        category: CoverageCategory.VALIDATION,
        description: 'Form input validation',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'validation-required-fields',
        category: CoverageCategory.VALIDATION,
        description: 'Required field validation',
        testName: '',
        covered: false,
        priority: 'high',
      },
      {
        id: 'validation-data-types',
        category: CoverageCategory.VALIDATION,
        description: 'Data type validation',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'validation-edge-cases',
        category: CoverageCategory.VALIDATION,
        description: 'Edge case validation',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Error Handling
      {
        id: 'error-network',
        category: CoverageCategory.ERROR_HANDLING,
        description: 'Network error handling',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'error-timeout',
        category: CoverageCategory.ERROR_HANDLING,
        description: 'Timeout error handling',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'error-validation',
        category: CoverageCategory.ERROR_HANDLING,
        description: 'Validation error display',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'error-recovery',
        category: CoverageCategory.ERROR_HANDLING,
        description: 'Error recovery mechanisms',
        testName: '',
        covered: false,
        priority: 'low',
      },

      // Accessibility
      {
        id: 'accessibility-keyboard',
        category: CoverageCategory.ACCESSIBILITY,
        description: 'Keyboard navigation',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'accessibility-screen-reader',
        category: CoverageCategory.ACCESSIBILITY,
        description: 'Screen reader compatibility',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'accessibility-contrast',
        category: CoverageCategory.ACCESSIBILITY,
        description: 'Color contrast compliance',
        testName: '',
        covered: false,
        priority: 'low',
      },
      {
        id: 'accessibility-focus',
        category: CoverageCategory.ACCESSIBILITY,
        description: 'Focus management',
        testName: '',
        covered: false,
        priority: 'medium',
      },

      // Performance
      {
        id: 'performance-load-time',
        category: CoverageCategory.PERFORMANCE,
        description: 'Page load time',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'performance-memory',
        category: CoverageCategory.PERFORMANCE,
        description: 'Memory usage',
        testName: '',
        covered: false,
        priority: 'low',
      },
      {
        id: 'performance-network',
        category: CoverageCategory.PERFORMANCE,
        description: 'Network request optimization',
        testName: '',
        covered: false,
        priority: 'medium',
      },
      {
        id: 'performance-caching',
        category: CoverageCategory.PERFORMANCE,
        description: 'Caching mechanisms',
        testName: '',
        covered: false,
        priority: 'low',
      },
    ];
  }

  /**
   * Mark coverage item as covered by a test
   */
  public markCovered(coverageId: string, testName: string): void {
    const item = this.coverageItems.find((item) => item.id === coverageId);
    if (item) {
      item.covered = true;
      item.testName = testName;

      // Track test coverage
      if (!this.testCoverage.has(testName)) {
        this.testCoverage.set(testName, []);
      }
      this.testCoverage.get(testName)!.push(coverageId);
    }
  }

  /**
   * Mark multiple coverage items as covered
   */
  public markMultipleCovered(coverageIds: string[], testName: string): void {
    coverageIds.forEach((id) => this.markCovered(id, testName));
  }

  /**
   * Get coverage statistics
   */
  public getCoverageStats(): CoverageStats {
    const totalItems = this.coverageItems.length;
    const coveredItems = this.coverageItems.filter((item) => item.covered).length;
    const coveragePercentage = totalItems > 0 ? (coveredItems / totalItems) * 100 : 0;

    // Calculate coverage by category
    const coverageByCategory: Record<
      CoverageCategory,
      { total: number; covered: number; percentage: number }
    > = {} as any;

    for (const category of Object.values(CoverageCategory)) {
      const categoryItems = this.coverageItems.filter((item) => item.category === category);
      const categoryTotal = categoryItems.length;
      const categoryCovered = categoryItems.filter((item) => item.covered).length;
      const categoryPercentage = categoryTotal > 0 ? (categoryCovered / categoryTotal) * 100 : 0;

      coverageByCategory[category] = {
        total: categoryTotal,
        covered: categoryCovered,
        percentage: categoryPercentage,
      };
    }

    // Get uncovered items
    const uncoveredItems = this.coverageItems.filter((item) => !item.covered);
    const highPriorityUncovered = uncoveredItems.filter((item) => item.priority === 'high');

    return {
      totalItems,
      coveredItems,
      coveragePercentage,
      coverageByCategory,
      uncoveredItems,
      highPriorityUncovered,
    };
  }

  /**
   * Generate coverage report
   */
  public generateCoverageReport(): string {
    const stats = this.getCoverageStats();

    let report = '\n📊 TEST COVERAGE REPORT\n';
    report += '='.repeat(50) + '\n';
    report += `Overall Coverage: ${stats.coveragePercentage.toFixed(1)}% (${stats.coveredItems}/${stats.totalItems})\n\n`;

    report += 'Coverage by Category:\n';
    for (const [category, categoryStats] of Object.entries(stats.coverageByCategory)) {
      const status =
        categoryStats.percentage >= 80 ? '✅' : categoryStats.percentage >= 60 ? '⚠️' : '❌';
      report += `  ${status} ${category}: ${categoryStats.percentage.toFixed(1)}% (${categoryStats.covered}/${categoryStats.total})\n`;
    }

    report += `\nHigh Priority Uncovered: ${stats.highPriorityUncovered.length}\n`;
    if (stats.highPriorityUncovered.length > 0) {
      report += 'High Priority Items to Test:\n';
      stats.highPriorityUncovered.forEach((item) => {
        report += `  - ${item.description} (${item.id})\n`;
      });
    }

    report += `\nTotal Uncovered: ${stats.uncoveredItems.length}\n`;
    if (stats.uncoveredItems.length > 0) {
      report += 'All Uncovered Items:\n';
      stats.uncoveredItems.forEach((item) => {
        const priority = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
        report += `  ${priority} ${item.description} (${item.id})\n`;
      });
    }

    return report;
  }

  /**
   * Get test coverage details
   */
  public getTestCoverage(testName: string): CoverageItem[] {
    const coverageIds = this.testCoverage.get(testName) || [];
    return this.coverageItems.filter((item) => coverageIds.includes(item.id));
  }

  /**
   * Get all coverage items
   */
  public getAllCoverageItems(): CoverageItem[] {
    return [...this.coverageItems];
  }

  /**
   * Reset coverage data
   */
  public resetCoverage(): void {
    this.coverageItems.forEach((item) => {
      item.covered = false;
      item.testName = '';
    });
    this.testCoverage.clear();
  }

  /**
   * Export coverage data
   */
  public exportCoverageData(): {
    stats: CoverageStats;
    items: CoverageItem[];
    testCoverage: Record<string, string[]>;
  } {
    return {
      stats: this.getCoverageStats(),
      items: this.getAllCoverageItems(),
      testCoverage: Object.fromEntries(this.testCoverage),
    };
  }
}

// Export singleton instance
export const coverageReporter = CoverageReporter.getInstance();

// Export convenience functions
export const markCovered = (coverageId: string, testName: string) =>
  coverageReporter.markCovered(coverageId, testName);
export const markMultipleCovered = (coverageIds: string[], testName: string) =>
  coverageReporter.markMultipleCovered(coverageIds, testName);
export const getCoverageStats = () => coverageReporter.getCoverageStats();
export const generateCoverageReport = () => coverageReporter.generateCoverageReport();
export const getTestCoverage = (testName: string) => coverageReporter.getTestCoverage(testName);
export const getAllCoverageItems = () => coverageReporter.getAllCoverageItems();
export const resetCoverage = () => coverageReporter.resetCoverage();
export const exportCoverageData = () => coverageReporter.exportCoverageData();

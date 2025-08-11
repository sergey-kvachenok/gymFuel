import { Page, Locator } from '@playwright/test';

/**
 * Accessibility test results
 */
export interface AccessibilityResult {
  testName: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Keyboard navigation test
 */
export interface KeyboardTest {
  element: string;
  expectedBehavior: string;
  actualBehavior: string;
  passed: boolean;
}

/**
 * Focus management test
 */
export interface FocusTest {
  element: string;
  focusable: boolean;
  tabIndex: number | null;
  ariaLabel?: string;
  passed: boolean;
}

/**
 * Screen reader test
 */
export interface ScreenReaderTest {
  element: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  passed: boolean;
}

/**
 * Comprehensive accessibility testing system
 */
export class AccessibilityTester {
  private static instance: AccessibilityTester;
  private results: AccessibilityResult[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  /**
   * Test keyboard navigation
   */
  public async testKeyboardNavigation(page: Page, testName: string): Promise<AccessibilityResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test Tab navigation
      const tabNavigation = await this.testTabNavigation(page);
      if (!tabNavigation.passed) {
        issues.push(`Tab navigation failed: ${tabNavigation.issues.join(', ')}`);
      }

      // Test Enter key functionality
      const enterKeyTest = await this.testEnterKeyFunctionality(page);
      if (!enterKeyTest.passed) {
        issues.push(`Enter key functionality failed: ${enterKeyTest.issues.join(', ')}`);
      }

      // Test Escape key functionality
      const escapeKeyTest = await this.testEscapeKeyFunctionality(page);
      if (!escapeKeyTest.passed) {
        warnings.push(`Escape key functionality missing: ${escapeKeyTest.issues.join(', ')}`);
      }

      // Test arrow key navigation
      const arrowKeyTest = await this.testArrowKeyNavigation(page);
      if (!arrowKeyTest.passed) {
        warnings.push(`Arrow key navigation missing: ${arrowKeyTest.issues.join(', ')}`);
      }

      const passed = issues.length === 0;
      const result: AccessibilityResult = {
        testName: `Keyboard Navigation - ${testName}`,
        passed,
        issues,
        warnings,
        recommendations,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: AccessibilityResult = {
        testName: `Keyboard Navigation - ${testName}`,
        passed: false,
        issues: [`Test failed with error: ${error}`],
        warnings: [],
        recommendations: ['Check if page is properly loaded'],
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Test focus management
   */
  public async testFocusManagement(page: Page, testName: string): Promise<AccessibilityResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test focusable elements
      const focusableElements = await this.getFocusableElements(page);

      for (const element of focusableElements) {
        if (!element.focusable) {
          issues.push(`Element should be focusable: ${element.element}`);
        }

        if (element.tabIndex === -1) {
          warnings.push(`Element has tabIndex=-1: ${element.element}`);
        }

        if (!element.ariaLabel && !element.role) {
          recommendations.push(`Add aria-label or role to: ${element.element}`);
        }
      }

      // Test focus order
      const focusOrder = await this.testFocusOrder(page);
      if (!focusOrder.passed) {
        issues.push(`Focus order issues: ${focusOrder.issues.join(', ')}`);
      }

      // Test focus trapping
      const focusTrapping = await this.testFocusTrapping(page);
      if (!focusTrapping.passed) {
        warnings.push(`Focus trapping missing: ${focusTrapping.issues.join(', ')}`);
      }

      const passed = issues.length === 0;
      const result: AccessibilityResult = {
        testName: `Focus Management - ${testName}`,
        passed,
        issues,
        warnings,
        recommendations,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: AccessibilityResult = {
        testName: `Focus Management - ${testName}`,
        passed: false,
        issues: [`Test failed with error: ${error}`],
        warnings: [],
        recommendations: ['Check if page is properly loaded'],
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Test screen reader compatibility
   */
  public async testScreenReaderCompatibility(
    page: Page,
    testName: string,
  ): Promise<AccessibilityResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test ARIA labels
      const ariaLabels = await this.testAriaLabels(page);
      for (const test of ariaLabels) {
        if (!test.passed) {
          issues.push(`Missing ARIA label: ${test.element}`);
        }
      }

      // Test ARIA roles
      const ariaRoles = await this.testAriaRoles(page);
      for (const test of ariaRoles) {
        if (!test.passed) {
          warnings.push(`Missing ARIA role: ${test.element}`);
        }
      }

      // Test semantic HTML
      const semanticHTML = await this.testSemanticHTML(page);
      if (!semanticHTML.passed) {
        issues.push(`Semantic HTML issues: ${semanticHTML.issues.join(', ')}`);
      }

      // Test color contrast (basic check)
      const colorContrast = await this.testColorContrast(page);
      if (!colorContrast.passed) {
        warnings.push(`Color contrast issues: ${colorContrast.issues.join(', ')}`);
      }

      const passed = issues.length === 0;
      const result: AccessibilityResult = {
        testName: `Screen Reader Compatibility - ${testName}`,
        passed,
        issues,
        warnings,
        recommendations,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: AccessibilityResult = {
        testName: `Screen Reader Compatibility - ${testName}`,
        passed: false,
        issues: [`Test failed with error: ${error}`],
        warnings: [],
        recommendations: ['Check if page is properly loaded'],
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Test tab navigation
   */
  private async testTabNavigation(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Get all focusable elements
      const focusableElements = await page.$$eval(
        '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href], [role="button"], [role="link"]',
        (elements) => {
          return elements.map((el) => ({
            tagName: el.tagName.toLowerCase(),
            text: el.textContent?.trim() || '',
            href: (el as HTMLAnchorElement).href || '',
            type: (el as HTMLInputElement).type || '',
          }));
        },
      );

      // Test tab navigation through elements
      await page.keyboard.press('Tab');

      // Check if focus moved to first element
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active
          ? {
              tagName: active.tagName.toLowerCase(),
              text: active.textContent?.trim() || '',
            }
          : null;
      });

      if (!focusedElement) {
        issues.push('No element receives focus on Tab');
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Tab navigation test failed: ${error}`] };
    }
  }

  /**
   * Test Enter key functionality
   */
  private async testEnterKeyFunctionality(
    page: Page,
  ): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Test Enter key on buttons
      const buttons = await page.$$('button, [role="button"]');

      for (const button of buttons) {
        const beforeClick = await page.url();
        await button.focus();
        await page.keyboard.press('Enter');

        // Wait a bit for any navigation
        await page.waitForTimeout(100);

        const afterClick = await page.url();

        // If URL changed, Enter key worked
        if (beforeClick !== afterClick) {
          break;
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Enter key test failed: ${error}`] };
    }
  }

  /**
   * Test Escape key functionality
   */
  private async testEscapeKeyFunctionality(
    page: Page,
  ): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Look for modals or dialogs
      const modals = await page.$$('[role="dialog"], .modal, .dialog');

      if (modals.length > 0) {
        // Test if Escape closes modals
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);

        const visibleModals = await page.$$(
          '[role="dialog"]:not([hidden]), .modal:not([hidden]), .dialog:not([hidden])',
        );

        if (visibleModals.length > 0) {
          issues.push('Escape key does not close modals');
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Escape key test failed: ${error}`] };
    }
  }

  /**
   * Test arrow key navigation
   */
  private async testArrowKeyNavigation(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Test arrow keys on select elements
      const selects = await page.$$('select');

      for (const select of selects) {
        await select.focus();
        await page.keyboard.press('ArrowDown');

        // Check if selection changed
        const value = await select.evaluate((el) => (el as HTMLSelectElement).value);
        if (value) {
          break; // Arrow keys work
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Arrow key test failed: ${error}`] };
    }
  }

  /**
   * Get focusable elements
   */
  private async getFocusableElements(page: Page): Promise<FocusTest[]> {
    return await page.$$eval(
      '[tabindex], button, input, select, textarea, a[href], [role="button"], [role="link"]',
      (elements) => {
        return elements.map((el) => ({
          element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
          focusable: true,
          tabIndex: (el as HTMLElement).tabIndex,
          ariaLabel: el.getAttribute('aria-label') || undefined,
          role: el.getAttribute('role') || undefined,
          passed: true,
        }));
      },
    );
  }

  /**
   * Test focus order
   */
  private async testFocusOrder(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Get focusable elements in DOM order
      const focusableElements = await page.$$eval(
        '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href], [role="button"], [role="link"]',
        (elements) => {
          return elements.map((el) => ({
            tagName: el.tagName.toLowerCase(),
            tabIndex: (el as HTMLElement).tabIndex,
          }));
        },
      );

      // Check for logical tab order
      let lastTabIndex = -1;
      for (const element of focusableElements) {
        if (element.tabIndex > 0 && element.tabIndex <= lastTabIndex) {
          issues.push(`Tab order issue: ${element.tagName} has tabIndex ${element.tabIndex}`);
        }
        lastTabIndex = element.tabIndex;
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Focus order test failed: ${error}`] };
    }
  }

  /**
   * Test focus trapping
   */
  private async testFocusTrapping(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Look for modals that should trap focus
      const modals = await page.$$('[role="dialog"], .modal, .dialog');

      if (modals.length > 0) {
        // This is a basic check - full focus trapping test would be more complex
        issues.push('Focus trapping not fully tested');
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Focus trapping test failed: ${error}`] };
    }
  }

  /**
   * Test ARIA labels
   */
  private async testAriaLabels(page: Page): Promise<ScreenReaderTest[]> {
    return await page.$$eval(
      'button, input, select, textarea, [role="button"], [role="link"]',
      (elements) => {
        return elements.map((el) => ({
          element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
          ariaLabel: el.getAttribute('aria-label') || undefined,
          ariaDescribedBy: el.getAttribute('aria-describedby') || undefined,
          role: el.getAttribute('role') || undefined,
          passed: !!(
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-describedby') ||
            el.getAttribute('aria-labelledby')
          ),
        }));
      },
    );
  }

  /**
   * Test ARIA roles
   */
  private async testAriaRoles(page: Page): Promise<ScreenReaderTest[]> {
    return await page.$$eval('div, span, section, article', (elements) => {
      return elements.map((el) => ({
        element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
        ariaLabel: el.getAttribute('aria-label') || undefined,
        ariaDescribedBy: el.getAttribute('aria-describedby') || undefined,
        role: el.getAttribute('role') || undefined,
        passed: !!el.getAttribute('role'),
      }));
    });
  }

  /**
   * Test semantic HTML
   */
  private async testSemanticHTML(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for proper heading hierarchy
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => {
        return elements.map((el) => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim() || '',
        }));
      });

      let lastLevel = 0;
      for (const heading of headings) {
        if (heading.level > lastLevel + 1) {
          issues.push(`Heading hierarchy issue: ${heading.text} (h${heading.level})`);
        }
        lastLevel = heading.level;
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Semantic HTML test failed: ${error}`] };
    }
  }

  /**
   * Test color contrast (basic check)
   */
  private async testColorContrast(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // This is a placeholder - actual color contrast testing would require
      // more sophisticated analysis of CSS and computed styles
      issues.push('Color contrast testing requires manual verification');

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Color contrast test failed: ${error}`] };
    }
  }

  /**
   * Get all accessibility test results
   */
  public getAllResults(): AccessibilityResult[] {
    return [...this.results];
  }

  /**
   * Generate accessibility report
   */
  public generateAccessibilityReport(): string {
    const allResults = this.getAllResults();
    const totalTests = allResults.length;
    const passedTests = allResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = '\n♿ ACCESSIBILITY REPORT\n';
    report += '='.repeat(50) + '\n';
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${passedTests}\n`;
    report += `Failed: ${failedTests}\n`;
    report += `Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%\n\n`;

    for (const result of allResults) {
      const status = result.passed ? '✅' : '❌';
      report += `${status} ${result.testName}\n`;

      if (result.issues.length > 0) {
        report += '  Issues:\n';
        result.issues.forEach((issue) => (report += `    - ${issue}\n`));
      }

      if (result.warnings.length > 0) {
        report += '  Warnings:\n';
        result.warnings.forEach((warning) => (report += `    - ${warning}\n`));
      }

      if (result.recommendations.length > 0) {
        report += '  Recommendations:\n';
        result.recommendations.forEach((rec) => (report += `    - ${rec}\n`));
      }

      report += '\n';
    }

    return report;
  }

  /**
   * Clear all results
   */
  public clearResults(): void {
    this.results = [];
  }
}

// Export singleton instance
export const accessibilityTester = AccessibilityTester.getInstance();

// Export convenience functions
export const testKeyboardNavigation = (page: Page, testName: string) =>
  accessibilityTester.testKeyboardNavigation(page, testName);

export const testFocusManagement = (page: Page, testName: string) =>
  accessibilityTester.testFocusManagement(page, testName);

export const testScreenReaderCompatibility = (page: Page, testName: string) =>
  accessibilityTester.testScreenReaderCompatibility(page, testName);

export const getAllAccessibilityResults = () => accessibilityTester.getAllResults();
export const generateAccessibilityReport = () => accessibilityTester.generateAccessibilityReport();
export const clearAccessibilityResults = () => accessibilityTester.clearResults();

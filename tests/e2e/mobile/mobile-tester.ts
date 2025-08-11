import { Page, BrowserContext } from '@playwright/test';

/**
 * Mobile device configurations
 */
export interface MobileDevice {
  name: string;
  width: number;
  height: number;
  userAgent: string;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

/**
 * Mobile test results
 */
export interface MobileTestResult {
  testName: string;
  device: MobileDevice;
  passed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Responsive breakpoint test
 */
export interface ResponsiveTest {
  breakpoint: string;
  width: number;
  height: number;
  passed: boolean;
  issues: string[];
}

/**
 * Touch interaction test
 */
export interface TouchTest {
  element: string;
  interaction: 'tap' | 'swipe' | 'pinch' | 'longPress';
  passed: boolean;
  issues: string[];
}

/**
 * Mobile-specific functionality test
 */
export interface MobileFunctionalityTest {
  feature: string;
  passed: boolean;
  issues: string[];
}

/**
 * Comprehensive mobile testing system
 */
export class MobileTester {
  private static instance: MobileTester;
  private results: MobileTestResult[] = [];
  private devices: MobileDevice[] = [];

  private constructor() {
    this.initializeDevices();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MobileTester {
    if (!MobileTester.instance) {
      MobileTester.instance = new MobileTester();
    }
    return MobileTester.instance;
  }

  /**
   * Initialize common mobile devices
   */
  private initializeDevices(): void {
    this.devices = [
      // iPhone devices
      {
        name: 'iPhone 12',
        width: 390,
        height: 844,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
      {
        name: 'iPhone SE',
        width: 375,
        height: 667,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
      // Android devices
      {
        name: 'Samsung Galaxy S21',
        width: 360,
        height: 800,
        userAgent:
          'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
      {
        name: 'Google Pixel 5',
        width: 393,
        height: 851,
        userAgent:
          'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
      },
      // Tablet devices
      {
        name: 'iPad',
        width: 768,
        height: 1024,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
      {
        name: 'Samsung Galaxy Tab S7',
        width: 800,
        height: 1280,
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    ];
  }

  /**
   * Configure context for mobile testing
   */
  public async configureMobileContext(
    context: BrowserContext,
    device: MobileDevice,
  ): Promise<void> {
    await context.setViewportSize({ width: device.width, height: device.height });
    await context.setUserAgent(device.userAgent);
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Enable touch events
    if (device.hasTouch) {
      await context.addInitScript(() => {
        // Simulate touch capabilities
        Object.defineProperty(navigator, 'maxTouchPoints', { value: 5 });
        Object.defineProperty(navigator, 'msMaxTouchPoints', { value: 5 });
      });
    }
  }

  /**
   * Test responsive design across breakpoints
   */
  public async testResponsiveDesign(page: Page, device: MobileDevice): Promise<MobileTestResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Set viewport for device
      await page.setViewportSize({ width: device.width, height: device.height });

      // Test viewport meta tag
      const viewportTest = await this.testViewportMetaTag(page);
      if (!viewportTest.passed) {
        issues.push(`Viewport meta tag issues: ${viewportTest.issues.join(', ')}`);
      }

      // Test responsive layout
      const layoutTest = await this.testResponsiveLayout(page, device);
      if (!layoutTest.passed) {
        issues.push(`Layout issues: ${layoutTest.issues.join(', ')}`);
      }

      // Test touch targets
      const touchTargetTest = await this.testTouchTargets(page);
      if (!touchTargetTest.passed) {
        issues.push(`Touch target issues: ${touchTargetTest.issues.join(', ')}`);
      }

      // Test mobile navigation
      const navigationTest = await this.testMobileNavigation(page);
      if (!navigationTest.passed) {
        issues.push(`Mobile navigation issues: ${navigationTest.issues.join(', ')}`);
      }

      // Test mobile forms
      const formTest = await this.testMobileForms(page);
      if (!formTest.passed) {
        issues.push(`Mobile form issues: ${formTest.issues.join(', ')}`);
      }

      const passed = issues.length === 0;
      const result: MobileTestResult = {
        testName: `Mobile Responsive Design - ${device.name}`,
        device,
        passed,
        issues,
        warnings,
        recommendations,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: MobileTestResult = {
        testName: `Mobile Responsive Design - ${device.name}`,
        device,
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
   * Test touch interactions
   */
  public async testTouchInteractions(page: Page, device: MobileDevice): Promise<MobileTestResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Configure for touch
      await this.configureMobileContext(page.context(), device);

      // Test tap interactions
      const tapTest = await this.testTapInteractions(page);
      if (!tapTest.passed) {
        issues.push(`Tap interaction issues: ${tapTest.issues.join(', ')}`);
      }

      // Test swipe gestures
      const swipeTest = await this.testSwipeGestures(page);
      if (!swipeTest.passed) {
        warnings.push(`Swipe gesture issues: ${swipeTest.issues.join(', ')}`);
      }

      // Test long press
      const longPressTest = await this.testLongPress(page);
      if (!longPressTest.passed) {
        warnings.push(`Long press issues: ${longPressTest.issues.join(', ')}`);
      }

      // Test pinch zoom
      const pinchTest = await this.testPinchZoom(page);
      if (!pinchTest.passed) {
        warnings.push(`Pinch zoom issues: ${pinchTest.issues.join(', ')}`);
      }

      const passed = issues.length === 0;
      const result: MobileTestResult = {
        testName: `Touch Interactions - ${device.name}`,
        device,
        passed,
        issues,
        warnings,
        recommendations,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: MobileTestResult = {
        testName: `Touch Interactions - ${device.name}`,
        device,
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
   * Test mobile-specific functionality
   */
  public async testMobileFunctionality(
    page: Page,
    device: MobileDevice,
  ): Promise<MobileTestResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test mobile keyboard
      const keyboardTest = await this.testMobileKeyboard(page);
      if (!keyboardTest.passed) {
        issues.push(`Mobile keyboard issues: ${keyboardTest.issues.join(', ')}`);
      }

      // Test mobile scrolling
      const scrollTest = await this.testMobileScrolling(page);
      if (!scrollTest.passed) {
        issues.push(`Mobile scrolling issues: ${scrollTest.issues.join(', ')}`);
      }

      // Test mobile performance
      const performanceTest = await this.testMobilePerformance(page);
      if (!performanceTest.passed) {
        warnings.push(`Mobile performance issues: ${performanceTest.issues.join(', ')}`);
      }

      // Test mobile accessibility
      const accessibilityTest = await this.testMobileAccessibility(page);
      if (!accessibilityTest.passed) {
        issues.push(`Mobile accessibility issues: ${accessibilityTest.issues.join(', ')}`);
      }

      const passed = issues.length === 0;
      const result: MobileTestResult = {
        testName: `Mobile Functionality - ${device.name}`,
        device,
        passed,
        issues,
        warnings,
        recommendations,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: MobileTestResult = {
        testName: `Mobile Functionality - ${device.name}`,
        device,
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
   * Test viewport meta tag
   */
  private async testViewportMetaTag(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const viewportMeta = await page.$('meta[name="viewport"]');
      if (!viewportMeta) {
        issues.push('Missing viewport meta tag');
      } else {
        const content = await viewportMeta.getAttribute('content');
        if (!content || !content.includes('width=device-width')) {
          issues.push('Viewport meta tag missing width=device-width');
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Viewport test failed: ${error}`] };
    }
  }

  /**
   * Test responsive layout
   */
  private async testResponsiveLayout(
    page: Page,
    device: MobileDevice,
  ): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for horizontal scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        issues.push('Horizontal scrolling detected - layout may not be responsive');
      }

      // Check for elements extending beyond viewport
      const overflowingElements = await page.$$eval('*', (elements) => {
        return elements
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.right > window.innerWidth || rect.left < 0;
          })
          .map((el) => el.tagName.toLowerCase());
      });

      if (overflowingElements.length > 0) {
        issues.push(`Elements extending beyond viewport: ${overflowingElements.join(', ')}`);
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Layout test failed: ${error}`] };
    }
  }

  /**
   * Test touch targets
   */
  private async testTouchTargets(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const touchTargets = await page.$$eval(
        'button, input, select, textarea, a[href], [role="button"], [role="link"]',
        (elements) => {
          return elements.map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              tagName: el.tagName.toLowerCase(),
              width: rect.width,
              height: rect.height,
              minSize: Math.min(rect.width, rect.height),
            };
          });
        },
      );

      const smallTargets = touchTargets.filter((target) => target.minSize < 44);
      if (smallTargets.length > 0) {
        issues.push(
          `Touch targets too small: ${smallTargets.map((t) => `${t.tagName} (${t.minSize}px)`).join(', ')}`,
        );
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Touch target test failed: ${error}`] };
    }
  }

  /**
   * Test mobile navigation
   */
  private async testMobileNavigation(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for mobile menu
      const mobileMenu = await page.$(
        '[data-testid*="mobile-menu"], .mobile-menu, .hamburger-menu',
      );
      if (!mobileMenu) {
        issues.push('Mobile navigation menu not found');
      }

      // Check for navigation accessibility
      const navElements = await page.$$('nav, [role="navigation"]');
      if (navElements.length === 0) {
        issues.push('No navigation elements found');
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Navigation test failed: ${error}`] };
    }
  }

  /**
   * Test mobile forms
   */
  private async testMobileForms(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const inputs = await page.$$('input, select, textarea');

      for (const input of inputs) {
        const inputType = await input.getAttribute('type');
        const inputSize = await input.boundingBox();

        if (inputSize && inputSize.height < 44) {
          issues.push(`Form input too small: ${inputType || 'unknown'} (${inputSize.height}px)`);
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Form test failed: ${error}`] };
    }
  }

  /**
   * Test tap interactions
   */
  private async testTapInteractions(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const clickableElements = await page.$$('button, a[href], [role="button"], [role="link"]');

      for (const element of clickableElements) {
        const beforeClick = await page.url();
        await element.tap();
        await page.waitForTimeout(100);

        const afterClick = await page.url();

        // If URL changed, tap worked
        if (beforeClick !== afterClick) {
          break;
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Tap test failed: ${error}`] };
    }
  }

  /**
   * Test swipe gestures
   */
  private async testSwipeGestures(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Test horizontal swipe
      await page.mouse.move(100, 400);
      await page.mouse.down();
      await page.mouse.move(300, 400);
      await page.mouse.up();

      // Test vertical swipe
      await page.mouse.move(200, 100);
      await page.mouse.down();
      await page.mouse.move(200, 300);
      await page.mouse.up();

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Swipe test failed: ${error}`] };
    }
  }

  /**
   * Test long press
   */
  private async testLongPress(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Simulate long press
      await page.mouse.move(200, 200);
      await page.mouse.down();
      await page.waitForTimeout(500);
      await page.mouse.up();

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Long press test failed: ${error}`] };
    }
  }

  /**
   * Test pinch zoom
   */
  private async testPinchZoom(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Simulate pinch zoom (basic test)
      const initialScale = await page.evaluate(() => window.visualViewport?.scale || 1);

      // This would require more sophisticated touch simulation
      issues.push('Pinch zoom requires advanced touch simulation');

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Pinch zoom test failed: ${error}`] };
    }
  }

  /**
   * Test mobile keyboard
   */
  private async testMobileKeyboard(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const inputs = await page.$$(
        'input[type="text"], input[type="email"], input[type="password"], textarea',
      );

      for (const input of inputs) {
        await input.focus();
        await page.keyboard.type('test');

        // Check if input received the text
        const value = await input.inputValue();
        if (value !== 'test') {
          issues.push('Mobile keyboard input not working properly');
          break;
        }
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Keyboard test failed: ${error}`] };
    }
  }

  /**
   * Test mobile scrolling
   */
  private async testMobileScrolling(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const initialScrollY = await page.evaluate(() => window.scrollY);

      // Test vertical scrolling
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(100);

      const newScrollY = await page.evaluate(() => window.scrollY);
      if (newScrollY <= initialScrollY) {
        issues.push('Vertical scrolling not working');
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Scrolling test failed: ${error}`] };
    }
  }

  /**
   * Test mobile performance
   */
  private async testMobilePerformance(page: Page): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Measure page load time
      const loadTime = await page.evaluate(() => {
        const perf = performance.timing;
        return perf.loadEventEnd - perf.navigationStart;
      });

      if (loadTime > 3000) {
        issues.push(`Page load time too slow: ${loadTime}ms`);
      }

      // Check for large images
      const largeImages = await page.$$eval('img', (images) => {
        return images.filter((img) => {
          const rect = img.getBoundingClientRect();
          return rect.width > 800 || rect.height > 600;
        }).length;
      });

      if (largeImages > 0) {
        issues.push(`${largeImages} large images detected - consider optimization`);
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Performance test failed: ${error}`] };
    }
  }

  /**
   * Test mobile accessibility
   */
  private async testMobileAccessibility(
    page: Page,
  ): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for proper touch target sizes
      const smallTargets = await page.$$eval(
        'button, input, select, textarea, a[href]',
        (elements) => {
          return elements.filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width < 44 || rect.height < 44;
          }).length;
        },
      );

      if (smallTargets > 0) {
        issues.push(`${smallTargets} elements have touch targets smaller than 44px`);
      }

      return { passed: issues.length === 0, issues };
    } catch (error) {
      return { passed: false, issues: [`Accessibility test failed: ${error}`] };
    }
  }

  /**
   * Get all mobile test results
   */
  public getAllResults(): MobileTestResult[] {
    return [...this.results];
  }

  /**
   * Generate mobile testing report
   */
  public generateMobileReport(): string {
    const allResults = this.getAllResults();
    const totalTests = allResults.length;
    const passedTests = allResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = '\n📱 MOBILE TESTING REPORT\n';
    report += '='.repeat(50) + '\n';
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${passedTests}\n`;
    report += `Failed: ${failedTests}\n`;
    report += `Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%\n\n`;

    for (const result of allResults) {
      const status = result.passed ? '✅' : '❌';
      report += `${status} ${result.testName} (${result.device.name})\n`;

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
   * Get available devices
   */
  public getDevices(): MobileDevice[] {
    return [...this.devices];
  }

  /**
   * Clear all results
   */
  public clearResults(): void {
    this.results = [];
  }
}

// Export singleton instance
export const mobileTester = MobileTester.getInstance();

// Export convenience functions
export const configureMobileContext = (context: BrowserContext, device: MobileDevice) =>
  mobileTester.configureMobileContext(context, device);

export const testResponsiveDesign = (page: Page, device: MobileDevice) =>
  mobileTester.testResponsiveDesign(page, device);

export const testTouchInteractions = (page: Page, device: MobileDevice) =>
  mobileTester.testTouchInteractions(page, device);

export const testMobileFunctionality = (page: Page, device: MobileDevice) =>
  mobileTester.testMobileFunctionality(page, device);

export const getAllMobileResults = () => mobileTester.getAllResults();
export const generateMobileReport = () => mobileTester.generateMobileReport();
export const getDevices = () => mobileTester.getDevices();
export const clearMobileResults = () => mobileTester.clearResults();

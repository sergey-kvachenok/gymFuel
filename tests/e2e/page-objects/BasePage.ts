import { Page, Locator, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

/**
 * Base page object class that provides common functionality
 * for all page objects in the application
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = TEST_CONFIG.BASE_URL;
  }

  /**
   * Navigate to the page
   */
  async navigate(path: string = ''): Promise<void> {
    const url = path ? `${this.baseUrl}${path}` : this.baseUrl;
    await this.page.goto(url, { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await this.page.waitForLoadState('networkidle', {
      timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE,
    });
  }

  /**
   * Wait for the page to be loaded and ready
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', {
      timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE,
    });
  }

  /**
   * Get a locator by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get a locator by role and name
   */
  getByRole(role: string, name?: string): Locator {
    return this.page.getByRole(role as any, name ? { name } : undefined);
  }

  /**
   * Get a locator by text
   */
  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElementVisible(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION,
    });
  }

  /**
   * Wait for an element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeHidden({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION,
    });
  }

  /**
   * Click an element
   */
  async clickElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.click({ timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION });
  }

  /**
   * Fill a form field
   */
  async fillField(locator: Locator, value: string, timeout?: number): Promise<void> {
    await locator.fill(value, { timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION });
  }

  /**
   * Clear a form field
   */
  async clearField(locator: Locator, timeout?: number): Promise<void> {
    await locator.clear({ timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION });
  }

  /**
   * Select an option from a dropdown
   */
  async selectOption(locator: Locator, value: string, timeout?: number): Promise<void> {
    await locator.selectOption(value, { timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION });
  }

  /**
   * Get the current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if the current URL matches a pattern
   */
  async isOnPage(urlPattern: string): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes(urlPattern);
  }

  /**
   * Wait for URL to change
   */
  async waitForUrlChange(urlPattern: string, timeout?: number): Promise<void> {
    await this.page.waitForURL((url) => url.pathname.includes(urlPattern), {
      timeout: timeout || TEST_CONFIG.TIMEOUTS.ACTION,
    });
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name?: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = name ? `${name}_${timestamp}` : `screenshot_${timestamp}`;
    await this.page.screenshot({ path: `test-results/${screenshotName}.png` });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Check if an element exists
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for a specific condition
   */
  async waitForCondition(condition: () => Promise<boolean>, timeout?: number): Promise<void> {
    const maxTime = timeout || TEST_CONFIG.TIMEOUTS.ACTION;
    const startTime = Date.now();

    while (Date.now() - startTime < maxTime) {
      if (await condition()) {
        return;
      }
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Condition not met within ${maxTime}ms`);
  }

  /**
   * Handle dialog (alert, confirm, prompt)
   */
  async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.on('dialog', (dialog) => {
      if (accept) {
        if (promptText && dialog.type() === 'prompt') {
          dialog.accept(promptText);
        } else {
          dialog.accept();
        }
      } else {
        dialog.dismiss();
      }
    });
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', {
      timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE,
    });
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }
}

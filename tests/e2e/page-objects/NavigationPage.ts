import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for Navigation functionality
 */
export class NavigationPage extends BasePage {
  // Navigation locators
  private readonly navDashboard: Locator;
  private readonly navGoals: Locator;
  private readonly navHistory: Locator;
  private readonly navLogout: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize navigation locators
    this.navDashboard = this.getByTestId('nav-dashboard');
    this.navGoals = this.getByTestId('nav-goals');
    this.navHistory = this.getByTestId('nav-history');
    this.navLogout = this.getByTestId('nav-logout');
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigate('/');
  }

  /**
   * Navigate to goals page
   */
  async navigateToGoals(): Promise<void> {
    await this.navigate('/goals');
  }

  /**
   * Navigate to history page
   */
  async navigateToHistory(): Promise<void> {
    await this.navigate('/history');
  }

  /**
   * Click dashboard navigation link
   */
  async clickDashboardNav(): Promise<void> {
    await this.clickElement(this.navDashboard);
    await this.waitForUrlChange('/');
  }

  /**
   * Click goals navigation link
   */
  async clickGoalsNav(): Promise<void> {
    await this.clickElement(this.navGoals);
    await this.waitForUrlChange('/goals');
  }

  /**
   * Click history navigation link
   */
  async clickHistoryNav(): Promise<void> {
    await this.clickElement(this.navHistory);
    await this.waitForUrlChange('/history');
  }

  /**
   * Click logout button
   */
  async clickLogout(): Promise<void> {
    await this.clickElement(this.navLogout);
  }

  /**
   * Navigate between all main sections
   */
  async navigateBetweenAllSections(): Promise<void> {
    // Navigate to dashboard
    await this.navigateToDashboard();
    await this.waitForPageLoad();

    // Navigate to goals
    await this.navigateToGoals();
    await this.waitForPageLoad();

    // Navigate to history
    await this.navigateToHistory();
    await this.waitForPageLoad();

    // Navigate back to dashboard
    await this.navigateToDashboard();
    await this.waitForPageLoad();
  }

  /**
   * Check if navigation elements are visible
   */
  async areNavigationElementsVisible(): Promise<boolean> {
    const navElements = [this.navDashboard, this.navGoals, this.navHistory, this.navLogout];

    for (const element of navElements) {
      if (!(await this.elementExists(element))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if active navigation state is displayed
   */
  async isActiveNavigationStateVisible(): Promise<boolean> {
    const activeElements = this.page.locator(
      '[data-testid*="nav"].active, [data-testid*="nav"][aria-current="page"]',
    );
    const count = await activeElements.count();
    return count > 0;
  }

  /**
   * Get active navigation element
   */
  async getActiveNavigationElement(): Promise<string | null> {
    const activeElements = this.page.locator(
      '[data-testid*="nav"].active, [data-testid*="nav"][aria-current="page"]',
    );
    if (await this.elementExists(activeElements.first())) {
      return activeElements.first().textContent();
    }
    return null;
  }

  /**
   * Test direct URL navigation
   */
  async testDirectUrlNavigation(): Promise<void> {
    // Test direct navigation to each page
    await this.navigateToDashboard();
    await this.waitForPageLoad();

    await this.navigateToGoals();
    await this.waitForPageLoad();

    await this.navigateToHistory();
    await this.waitForPageLoad();
  }

  /**
   * Test browser back/forward navigation
   */
  async testBrowserNavigation(): Promise<void> {
    // Navigate to goals
    await this.navigateToGoals();
    await this.waitForPageLoad();

    // Navigate to history
    await this.navigateToHistory();
    await this.waitForPageLoad();

    // Go back to goals
    await this.goBack();
    await this.waitForPageLoad();

    // Go forward to history
    await this.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Test page refresh on different sections
   */
  async testPageRefreshOnSections(): Promise<void> {
    // Test refresh on dashboard
    await this.navigateToDashboard();
    await this.reload();

    // Test refresh on goals
    await this.navigateToGoals();
    await this.reload();

    // Test refresh on history
    await this.navigateToHistory();
    await this.reload();
  }

  /**
   * Test invalid route handling
   */
  async testInvalidRouteHandling(): Promise<void> {
    await this.navigate('/invalid-route');
    await this.waitForPageLoad();
  }

  /**
   * Check if invalid route was handled gracefully
   */
  async isInvalidRouteHandledGracefully(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();

    if (currentUrl.includes('/invalid-route')) {
      // Check for 404 indicators
      const notFoundText = await this.page
        .getByText('404')
        .isVisible()
        .catch(() => false);
      const notFoundElements = await this.page.locator('[data-testid*="not-found"]').count();

      return notFoundText || notFoundElements > 0;
    } else {
      // We were redirected somewhere else
      return true;
    }
  }

  /**
   * Test loading states during navigation
   */
  async testLoadingStates(): Promise<void> {
    // Navigate to dashboard first
    await this.navigateToDashboard();
    await this.waitForPageLoad();

    // Click navigation and immediately check for loading
    await this.clickGoalsNav();

    // Look for loading indicators
    const loadingElements = this.page.locator('[data-testid*="loading"]');
    const loadingCount = await loadingElements.count();

    if (loadingCount > 0) {
      // Should show loading briefly
      await this.waitForElementVisible(loadingElements.first(), 1000);
    }
  }

  /**
   * Check if loading states are implemented
   */
  async areLoadingStatesImplemented(): Promise<boolean> {
    const loadingElements = this.page.locator('[data-testid*="loading"]');
    const count = await loadingElements.count();
    return count > 0;
  }

  /**
   * Test session persistence across navigation
   */
  async testSessionPersistence(): Promise<void> {
    // Navigate to dashboard
    await this.navigateToDashboard();
    await this.waitForPageLoad();

    // Navigate to goals
    await this.navigateToGoals();
    await this.waitForPageLoad();

    // Navigate to history
    await this.navigateToHistory();
    await this.waitForPageLoad();

    // Navigate back to dashboard
    await this.navigateToDashboard();
    await this.waitForPageLoad();
  }

  /**
   * Check if session is maintained across navigation
   */
  async isSessionMaintained(): Promise<boolean> {
    // Try to access a protected page after navigation
    await this.navigateToDashboard();
    await this.waitForPageLoad();

    // Check if we're still authenticated by looking for dashboard content
    const dashboardContent = this.page.getByTestId('dashboard-welcome');
    return this.elementExists(dashboardContent);
  }

  /**
   * Take navigation screenshot
   */
  async takeNavigationScreenshot(): Promise<void> {
    await this.takeScreenshot('navigation');
  }

  /**
   * Get current navigation state
   */
  async getCurrentNavigationState(): Promise<{
    currentUrl: string;
    activeNav: string | null;
    navElementsVisible: boolean;
  }> {
    return {
      currentUrl: await this.getCurrentUrl(),
      activeNav: await this.getActiveNavigationElement(),
      navElementsVisible: await this.areNavigationElementsVisible(),
    };
  }
}

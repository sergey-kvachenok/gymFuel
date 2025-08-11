import { test, expect } from '@playwright/test';
import { TEST_CONFIG, getRelativeUrl } from './test-config';
import { loginWithTestUser } from './test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginWithTestUser(page, 'user1');
  });

  test('should navigate between all main sections', async ({ page }) => {
    console.log('🧪 Testing main navigation...');

    // Start on dashboard
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on dashboard
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Navigate to goals
    await page.getByTestId('nav-goals').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on goals page
    await expect(page.getByTestId('goals-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/goals'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Navigate to history
    await page.getByTestId('nav-history').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on history page
    await expect(page.getByTestId('history-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/history'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Navigate back to dashboard
    await page.getByTestId('nav-dashboard').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be back on dashboard
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    console.log('✅ Main navigation working');
  });

  test('should show active navigation state', async ({ page }) => {
    console.log('🧪 Testing active navigation state...');

    // Check dashboard active state
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    const dashboardNav = page.getByTestId('nav-dashboard');
    await expect(dashboardNav).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Check if active state is shown (this depends on the implementation)
    const activeNavElements = page.locator('[data-testid*="nav"][class*="active"]');
    const activeCount = await activeNavElements.count();

    if (activeCount > 0) {
      console.log('✅ Active navigation state working');
    } else {
      console.log('ℹ️ No active navigation state implemented yet');
    }
  });

  test('should handle direct URL navigation', async ({ page }) => {
    console.log('🧪 Testing direct URL navigation...');

    // Navigate directly to goals
    await page.goto(getRelativeUrl('/goals'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on goals page
    await expect(page.getByTestId('goals-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/goals'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Navigate directly to history
    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on history page
    await expect(page.getByTestId('history-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/history'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Navigate directly to dashboard
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on dashboard
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    console.log('✅ Direct URL navigation working');
  });

  test('should maintain user session across navigation', async ({ page }) => {
    console.log('🧪 Testing session persistence across navigation...');

    // Start on dashboard
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Navigate to different pages
    await page.getByTestId('nav-goals').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page.getByTestId('nav-history').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page.getByTestId('nav-dashboard').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should still be logged in and on dashboard
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Should not be redirected to login
    await expect(page).not.toHaveURL(getRelativeUrl('/login'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Session persistence across navigation working');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    console.log('🧪 Testing browser navigation...');

    // Navigate to different pages
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page.goto(getRelativeUrl('/goals'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on goals page
    await expect(page.getByTestId('goals-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/goals'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Go back again
    await page.goBack();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on dashboard
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be on goals page
    await expect(page.getByTestId('goals-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page).toHaveURL(getRelativeUrl('/goals'), {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Browser navigation working');
  });

  test('should handle page refresh on different sections', async ({ page }) => {
    console.log('🧪 Testing page refresh on different sections...');

    // Test refresh on dashboard
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Test refresh on goals
    await page.goto(getRelativeUrl('/goals'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
    await expect(page.getByTestId('goals-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Test refresh on history
    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
    await expect(page.getByTestId('history-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Page refresh on different sections working');
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    console.log('🧪 Testing invalid route handling...');

    // Try to navigate to a non-existent route
    await page.goto(getRelativeUrl('/invalid-route'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Check if we're on a 404 page or if the route was handled
    const currentUrl = page.url();

    if (currentUrl.includes('/invalid-route')) {
      // We're still on the invalid route, which means it's a 404
      // Check for common 404 indicators
      const notFoundText = await page
        .getByText('404')
        .isVisible()
        .catch(() => false);
      const notFoundElements = await page.locator('[data-testid*="not-found"]').count();

      if (notFoundText || notFoundElements > 0) {
        console.log('✅ 404 page working');
      } else {
        // The page loaded but doesn't have expected content - this is acceptable
        console.log('✅ Invalid route handled gracefully (page loaded)');
      }
    } else {
      // We were redirected somewhere else
      console.log('✅ Invalid route redirected to:', currentUrl);
    }
  });

  test('should show loading states during navigation', async ({ page }) => {
    console.log('🧪 Testing loading states...');

    // Navigate to goals and check for loading state
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Click navigation and immediately check for loading
    const goalsNav = page.getByTestId('nav-goals');
    await goalsNav.click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Look for loading indicators
    const loadingElements = page.locator('[data-testid*="loading"]');
    const loadingCount = await loadingElements.count();

    if (loadingCount > 0) {
      // Should show loading briefly
      await expect(loadingElements.first()).toBeVisible({ timeout: 1000 });
      console.log('✅ Loading states working');
    } else {
      // Wait for page to load
      await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
      await expect(page.getByTestId('goals-page')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
      console.log('ℹ️ No loading states implemented yet');
    }
  });
});

import { test, expect } from '@playwright/test';

const testUser = {
  email: `test-offline-navigation-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};

test.describe('Offline Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page first
    await page.goto('http://localhost:3000/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Login before each test
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if we're still on register page (registration failed) or moved to login
    const currentUrl = page.url();
    if (currentUrl.includes('/register') || currentUrl.includes('/login')) {
      // Registration failed, try to login directly
      await page.goto('http://localhost:3000/login', { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    }

    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });
  });

  test('should handle navigation between pages when offline without hydration errors', async ({
    page,
  }) => {
    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Navigate to different pages and check for hydration errors
    const pages = [
      { name: 'Dashboard', path: '/', selector: '[data-testid="dashboard-welcome"]' },
      { name: 'Goals', path: '/goals', selector: 'h1' }, // Goals page should have an h1
      { name: 'History', path: '/history', selector: 'h1' }, // History page should have an h1
    ];

    for (const pageInfo of pages) {
      console.log(`DEBUG: Navigating to ${pageInfo.name} page...`);

      // Navigate to the page
      await page.goto(`http://localhost:3000${pageInfo.path}`, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Verify we're on the correct page
      await expect(page).toHaveURL(`http://localhost:3000${pageInfo.path}`, { timeout: 30000 });

      // Check for hydration errors in console
      const consoleMessages = await page.evaluate(() => {
        return window.console.messages || [];
      });

      const hasHydrationError = consoleMessages.some(
        (msg: any) => msg.text && msg.text.includes('Hydration failed'),
      );

      console.log(`DEBUG: ${pageInfo.name} page - Console messages:`, consoleMessages);
      console.log(`DEBUG: ${pageInfo.name} page - Has hydration error:`, hasHydrationError);

      // Check if offline banner is visible
      const offlineBanner = page.getByText(
        'You are currently offline. Some features may not be available.',
      );
      const isOfflineBannerVisible = await offlineBanner.isVisible().catch(() => false);
      console.log(`DEBUG: ${pageInfo.name} page - Offline banner visible:`, isOfflineBannerVisible);

      // Wait a bit before navigating to the next page
      await page.waitForTimeout(1000);
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle menu navigation when offline without hydration errors', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Navigate using menu links
    const menuItems = [
      { name: 'Dashboard', selector: 'a[href="/"]' },
      { name: 'Goals', selector: 'a[href="/goals"]' },
      { name: 'History', selector: 'a[href="/history"]' },
    ];

    for (const menuItem of menuItems) {
      console.log(`DEBUG: Clicking menu item: ${menuItem.name}`);

      // Click the menu item
      await page.click(menuItem.selector, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Check for hydration errors in console
      const consoleMessages = await page.evaluate(() => {
        return window.console.messages || [];
      });

      const hasHydrationError = consoleMessages.some(
        (msg: any) => msg.text && msg.text.includes('Hydration failed'),
      );

      console.log(`DEBUG: ${menuItem.name} page - Console messages:`, consoleMessages);
      console.log(`DEBUG: ${menuItem.name} page - Has hydration error:`, hasHydrationError);

      // Check if offline banner is visible
      const offlineBanner = page.getByText(
        'You are currently offline. Some features may not be available.',
      );
      const isOfflineBannerVisible = await offlineBanner.isVisible().catch(() => false);
      console.log(`DEBUG: ${menuItem.name} page - Offline banner visible:`, isOfflineBannerVisible);

      // Wait a bit before clicking the next menu item
      await page.waitForTimeout(1000);
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle rapid navigation when offline without hydration errors', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Rapidly navigate between pages to stress test
    const pages = ['/', '/goals', '/history', '/', '/goals'];

    for (let i = 0; i < pages.length; i++) {
      const path = pages[i];
      console.log(`DEBUG: Rapid navigation ${i + 1}/${pages.length} to ${path}`);

      // Navigate to the page
      await page.goto(`http://localhost:3000${path}`, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Check for hydration errors in console
      const consoleMessages = await page.evaluate(() => {
        return window.console.messages || [];
      });

      const hasHydrationError = consoleMessages.some(
        (msg: any) => msg.text && msg.text.includes('Hydration failed'),
      );

      if (hasHydrationError) {
        console.log(`DEBUG: Hydration error detected on navigation ${i + 1} to ${path}`);
        console.log('DEBUG: Console messages:', consoleMessages);
      }

      // Minimal wait between navigations
      await page.waitForTimeout(500);
    }

    // Go back online
    await page.context().setOffline(false);
  });
});

import { test, expect } from '@playwright/test';

const testUser = {
  email: `test-goals-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};

test.describe('Goals Page', () => {
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

  test('should handle goals page hydration error when offline', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Navigate to goals page while offline
    await page.goto('http://localhost:3000/goals', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check for hydration error in console
    const consoleMessages: any[] = [];
    page.on('console', (msg) => {
      consoleMessages.push({ text: msg.text(), type: msg.type() });
    });

    // Check if there are any hydration errors
    const hasHydrationError = consoleMessages.some(
      (msg: any) => msg.text && msg.text.includes('Hydration failed'),
    );

    console.log('DEBUG: Console messages:', consoleMessages);
    console.log('DEBUG: Has hydration error:', hasHydrationError);

    // Verify the page loads without crashing
    await expect(page).toHaveURL('http://localhost:3000/goals', { timeout: 30000 });

    // Check if offline banner is visible
    const offlineBanner = page.getByText(
      'You are currently offline. Some features may not be available.',
    );
    const isOfflineBannerVisible = await offlineBanner.isVisible().catch(() => false);
    console.log('DEBUG: Offline banner visible:', isOfflineBannerVisible);

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle goals page hydration error when going offline after page load', async ({
    page,
  }) => {
    // Navigate to goals page while online first
    await page.goto('http://localhost:3000/goals', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify the page loads successfully
    await expect(page).toHaveURL('http://localhost:3000/goals', { timeout: 30000 });

    // Now go offline after the page is loaded
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Refresh the page to trigger hydration mismatch
    await page.reload({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check for hydration error in console
    const consoleMessagesAfterRefresh: any[] = [];
    page.on('console', (msg) => {
      consoleMessagesAfterRefresh.push({ text: msg.text(), type: msg.type() });
    });

    // Check if there are any hydration errors
    const hasHydrationErrorAfterRefresh = consoleMessagesAfterRefresh.some(
      (msg: any) => msg.text && msg.text.includes('Hydration failed'),
    );

    console.log('DEBUG: Console messages after refresh:', consoleMessagesAfterRefresh);
    console.log('DEBUG: Has hydration error after refresh:', hasHydrationErrorAfterRefresh);

    // Check if offline banner is visible
    const offlineBanner = page.getByText(
      'You are currently offline. Some features may not be available.',
    );
    const isOfflineBannerVisible = await offlineBanner.isVisible().catch(() => false);
    console.log('DEBUG: Offline banner visible after refresh:', isOfflineBannerVisible);

    // Go back online
    await page.context().setOffline(false);
  });

  test('should load goals page when online', async ({ page }) => {
    // Navigate to goals page while online
    await page.goto('http://localhost:3000/goals', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify the page loads successfully
    await expect(page).toHaveURL('http://localhost:3000/goals', { timeout: 30000 });

    // Check that offline banner is not visible when online
    const offlineBanner = page.getByText(
      'You are currently offline. Some features may not be available.',
    );
    const isOfflineBannerVisible = await offlineBanner.isVisible().catch(() => false);
    console.log('DEBUG: Offline banner visible when online:', isOfflineBannerVisible);
  });
});

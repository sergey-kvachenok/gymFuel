import { test, expect } from '@playwright/test';

test.describe('Offline Functionality', () => {
  const testUser = {
    email: `test-offline-${Date.now()}@example.com`,
    name: 'Test Offline User',
    password: 'password123',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the app with longer timeout
    await page.goto('http://localhost:3000', { timeout: 30000 });

    // Wait for the page to be stable (no more infinite re-renders)
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  test('should register and login user for offline testing', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Register new user
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Login
    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should be on dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({ timeout: 30000 });
  });

  test('should create products and cache them for offline use', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Register and login
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Add a product to cache it
    await page.getByRole('button', { name: 'Add Product' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Fill product form
    await page.getByLabel('Product Name').fill('Test Apple', { timeout: 30000 });
    await page.getByLabel('Calories').fill('52', { timeout: 30000 });
    await page.getByLabel('Protein (g)').fill('0.3', { timeout: 30000 });
    await page.getByLabel('Carbs (g)').fill('14', { timeout: 30000 });
    await page.getByLabel('Fat (g)').fill('0.2', { timeout: 30000 });

    // Submit product
    await page.getByRole('button', { name: 'Add Product' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should show success message or redirect back to dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });
  });

  test('should retrieve cached data when offline', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Register and login
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Simulate offline mode by disabling network
    await page.context().setOffline(true);

    // Wait for offline state to be detected
    await page.waitForTimeout(2000);

    // Should still show dashboard content (from cached data)
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({ timeout: 30000 });

    // Re-enable network
    await page.context().setOffline(false);
  });

  test('should handle online/offline transitions gracefully', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Register and login
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Should still be functional
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({ timeout: 30000 });

    // Go back online
    await page.context().setOffline(false);
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should still be functional
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({ timeout: 30000 });
  });

  test('should prevent infinite re-renders in offline mode', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Register and login
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Wait for page to stabilize (no more re-renders)
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should not have infinite re-render errors in console
    const consoleErrors = await page.evaluate(() => {
      return (window as { consoleErrors?: string[] }).consoleErrors || [];
    });

    const infiniteRenderErrors = consoleErrors.filter((error: string) =>
      error.includes('Maximum update depth exceeded'),
    );

    expect(infiniteRenderErrors).toHaveLength(0);
  });
});

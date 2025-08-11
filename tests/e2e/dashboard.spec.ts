import { test, expect } from '@playwright/test';

const testUser = {
  email: `test-dashboard-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
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

  test('should load dashboard when offline', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Refresh the page to test offline loading
    await page.reload({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should still be on the dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });

    // Check if dashboard elements are visible
    const addProductButton = await page
      .getByRole('button', { name: 'Add Product' })
      .isVisible()
      .catch(() => false);
    const addConsumptionButton = await page
      .getByRole('button', { name: 'Add Consumption' })
      .isVisible()
      .catch(() => false);

    console.log('DEBUG: Add Product button visible when offline:', addProductButton);
    console.log('DEBUG: Add Consumption button visible when offline:', addConsumptionButton);

    // Go back online
    await page.context().setOffline(false);
  });

  test('should debug product creation and visibility', async ({ page }) => {
    // Add a product first to cache it
    await page.getByRole('button', { name: 'Add Product' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Wait for product form to be visible
    await page.waitForSelector('[data-testid="product-form"]', { timeout: 30000 });

    // Fill product form
    await page.getByTestId('product-name').fill('Test Apple', { timeout: 30000 });
    await page.getByTestId('product-calories').fill('52', { timeout: 30000 });
    await page.getByTestId('product-protein').fill('0.3', { timeout: 30000 });
    await page.getByTestId('product-fat').fill('0.2', { timeout: 30000 });
    await page.getByTestId('product-carbs').fill('14', { timeout: 30000 });

    // Submit product
    await page.getByTestId('product-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify product was created by checking if we're back on dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });

    // Add a consumption to cache it
    await page.getByRole('button', { name: 'Add Consumption' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if the consumption form shows "No products available" or has products
    const noProductsText = page.getByText(
      'No products available. Add some products first to track your consumption.',
    );
    const hasNoProducts = await noProductsText.isVisible().catch(() => false);

    if (hasNoProducts) {
      console.log('DEBUG: No products available in consumption form');
      // This means the product wasn't cached properly
      return;
    }

    // If we get here, products should be available
    console.log('DEBUG: Products should be available in consumption form');

    // Try to find the product in the dropdown
    await page.getByText('Select a product...').click({ timeout: 30000 });
    await page.waitForTimeout(1000);

    // Check if Test Apple is visible in the dropdown
    const testAppleVisible = await page
      .getByText('Test Apple')
      .isVisible()
      .catch(() => false);
    console.log('DEBUG: Test Apple visible in dropdown:', testAppleVisible);
  });
});

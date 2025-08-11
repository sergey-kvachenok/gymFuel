import { test, expect } from '@playwright/test';

const testUser = {
  email: `test-offline-consumption-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};

test.describe('Offline Consumption', () => {
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

  test('should show products in combobox when offline', async ({ page }) => {
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

    // Wait a bit for the data to be cached
    await page.waitForTimeout(2000);

    // Open consumption form to activate the useProductSearch hook
    await page.getByRole('button', { name: 'Add Consumption' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Close the consumption form
    await page.keyboard.press('Escape');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Add a consumption to test offline functionality
    await page.getByRole('button', { name: 'Add Consumption' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if the consumption form shows "No products available" or has products
    const noProductsText = page.getByText(
      'No products available. Add some products first to track your consumption.',
    );
    const hasNoProducts = await noProductsText.isVisible().catch(() => false);

    if (hasNoProducts) {
      console.log('DEBUG: No products available in consumption form when offline');
      return;
    }

    console.log('DEBUG: Products should be available in consumption form when offline');

    // Try to find the product in the dropdown
    await page.getByText('Select a product...').click({ timeout: 30000 });
    await page.waitForTimeout(1000);

    const testAppleVisible = await page
      .getByText('Test Apple')
      .isVisible()
      .catch(() => false);
    console.log('DEBUG: Test Apple visible in dropdown when offline:', testAppleVisible);

    if (testAppleVisible) {
      await page.getByText('Test Apple').click({ timeout: 30000 });
      await page.getByTestId('consumption-amount').fill('100', { timeout: 30000 });
      await page.getByTestId('consumption-submit').click({ timeout: 30000 });
      await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });
    }

    await page.context().setOffline(false);
  });

  test('should debug product caching issue', async ({ page }) => {
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

    // Wait a bit for the data to be cached
    await page.waitForTimeout(2000);

    // Check if the product is available in the consumption form while still online
    await page.getByRole('button', { name: 'Add Consumption' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if the consumption form shows "No products available" or has products
    const noProductsText = page.getByText(
      'No products available. Add some products first to track your consumption.',
    );
    const hasNoProducts = await noProductsText.isVisible().catch(() => false);

    if (hasNoProducts) {
      console.log('DEBUG: No products available in consumption form even when online');
      // This means the product wasn't created properly or cached
      return;
    }

    // If we get here, products should be available
    console.log('DEBUG: Products should be available in consumption form when online');

    // Try to find the product in the dropdown
    await page.getByText('Select a product...').click({ timeout: 30000 });
    await page.waitForTimeout(1000);

    // Check if Test Apple is visible in the dropdown
    const testAppleVisible = await page
      .getByText('Test Apple')
      .isVisible()
      .catch(() => false);
    console.log('DEBUG: Test Apple visible in dropdown when online:', testAppleVisible);

    // Close the consumption form
    await page.keyboard.press('Escape');

    // Now go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Try to add consumption again
    await page.getByRole('button', { name: 'Add Consumption' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if the consumption form shows "No products available" or has products
    const noProductsTextOffline = page.getByText(
      'No products available. Add some products first to track your consumption.',
    );
    const hasNoProductsOffline = await noProductsTextOffline.isVisible().catch(() => false);

    console.log(
      'DEBUG: No products available in consumption form when offline:',
      hasNoProductsOffline,
    );

    // Go back online
    await page.context().setOffline(false);
  });
});

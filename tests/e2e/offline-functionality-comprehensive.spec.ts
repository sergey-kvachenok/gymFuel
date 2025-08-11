import { test, expect } from '@playwright/test';

test.describe('Comprehensive Offline Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Register a new user for each test
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForLoadState('networkidle');

    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    await page.getByTestId('register-email').fill(testEmail);
    await page.getByTestId('register-name').fill('Test User');
    await page.getByTestId('register-password').fill(testPassword);
    await page.getByTestId('register-submit').click();

    // Wait for registration and redirect to dashboard
    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('should create product online and access it offline', async ({ page }) => {
    // Create a product while online
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('product-name').fill('Test Apple');
    await page.getByTestId('product-calories').fill('52');
    await page.getByTestId('product-protein').fill('0.3');
    await page.getByTestId('product-fat').fill('0.2');
    await page.getByTestId('product-carbs').fill('14');
    await page.getByTestId('product-submit').click();

    // Wait for product creation and redirect
    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Verify product was created
    await expect(page.getByText('Test Apple')).toBeVisible();

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Verify product is still accessible offline
    await page.getByRole('button', { name: 'Add Consumption' }).click();
    await page.waitForLoadState('networkidle');

    // Check if product is available in consumption form
    await page.getByText('Select a product...').click();
    await expect(page.getByText('Test Apple')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
  });

  test('should create consumption offline and persist it', async ({ page }) => {
    // Create a product first
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('product-name').fill('Test Apple');
    await page.getByTestId('product-calories').fill('52');
    await page.getByTestId('product-protein').fill('0.3');
    await page.getByTestId('product-fat').fill('0.2');
    await page.getByTestId('product-carbs').fill('14');
    await page.getByTestId('product-submit').click();

    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Create consumption offline
    await page.getByRole('button', { name: 'Add Consumption' }).click();
    await page.waitForLoadState('networkidle');

    // Select product and fill amount
    await page.getByText('Select a product...').click();
    await page.getByText('Test Apple').click();
    await page.getByTestId('consumption-amount').fill('100');
    await page.getByTestId('consumption-submit').click();

    // Wait for form to close
    await page.waitForLoadState('networkidle');

    // Verify consumption appears in the list
    await expect(page.getByText('Test Apple')).toBeVisible();
    await expect(page.getByText('100g')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Verify consumption is still visible after going back online
    await expect(page.getByText('Test Apple')).toBeVisible();
    await expect(page.getByText('100g')).toBeVisible();
  });

  test('should update consumption list immediately after offline creation', async ({ page }) => {
    // Create a product first
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('product-name').fill('Test Apple');
    await page.getByTestId('product-calories').fill('52');
    await page.getByTestId('product-protein').fill('0.3');
    await page.getByTestId('product-fat').fill('0.2');
    await page.getByTestId('product-carbs').fill('14');
    await page.getByTestId('product-submit').click();

    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Get initial consumption count
    const initialCount = await page.locator('[data-testid="consumption-item"]').count();

    // Create consumption offline
    await page.getByRole('button', { name: 'Add Consumption' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByText('Select a product...').click();
    await page.getByText('Test Apple').click();
    await page.getByTestId('consumption-amount').fill('100');
    await page.getByTestId('consumption-submit').click();

    await page.waitForLoadState('networkidle');

    // Verify consumption count increased
    const newCount = await page.locator('[data-testid="consumption-item"]').count();
    expect(newCount).toBe(initialCount + 1);

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle multiple offline consumptions correctly', async ({ page }) => {
    // Create a product first
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('product-name').fill('Test Apple');
    await page.getByTestId('product-calories').fill('52');
    await page.getByTestId('product-protein').fill('0.3');
    await page.getByTestId('product-fat').fill('0.2');
    await page.getByTestId('product-carbs').fill('14');
    await page.getByTestId('product-submit').click();

    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Create multiple consumptions
    const consumptions = [
      { amount: '100', expectedText: '100g' },
      { amount: '150', expectedText: '150g' },
      { amount: '200', expectedText: '200g' },
    ];

    for (const consumption of consumptions) {
      await page.getByRole('button', { name: 'Add Consumption' }).click();
      await page.waitForLoadState('networkidle');

      await page.getByText('Select a product...').click();
      await page.getByText('Test Apple').click();
      await page.getByTestId('consumption-amount').fill(consumption.amount);
      await page.getByTestId('consumption-submit').click();

      await page.waitForLoadState('networkidle');
    }

    // Verify all consumptions are visible
    for (const consumption of consumptions) {
      await expect(page.getByText('Test Apple')).toBeVisible();
      await expect(page.getByText(consumption.expectedText)).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Verify all consumptions are still visible after sync
    for (const consumption of consumptions) {
      await expect(page.getByText('Test Apple')).toBeVisible();
      await expect(page.getByText(consumption.expectedText)).toBeVisible();
    }
  });

  test('should show offline banner when offline', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Verify offline banner is visible
    await expect(page.getByText('You are currently offline')).toBeVisible();
  });

  test('should handle online/offline transitions gracefully', async ({ page }) => {
    // Create a product while online
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('product-name').fill('Test Apple');
    await page.getByTestId('product-calories').fill('52');
    await page.getByTestId('product-protein').fill('0.3');
    await page.getByTestId('product-fat').fill('0.2');
    await page.getByTestId('product-carbs').fill('14');
    await page.getByTestId('product-submit').click();

    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Verify offline banner appears
    await expect(page.getByText('You are currently offline')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Verify offline banner disappears
    await expect(page.getByText('You are currently offline')).not.toBeVisible();

    // Verify product is still accessible
    await page.getByRole('button', { name: 'Add Consumption' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByText('Select a product...').click();
    await expect(page.getByText('Test Apple')).toBeVisible();
  });
});

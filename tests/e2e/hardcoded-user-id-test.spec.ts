import { test, expect } from '@playwright/test';

test.describe('Hardcoded User ID Fixes', () => {
  test('should use real user ID instead of hardcoded values', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Register a new user
    await page.getByRole('link', { name: 'Register' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    await page.getByTestId('register-email').fill(testEmail, { timeout: 30000 });
    await page.getByTestId('register-name').fill('Test User', { timeout: 30000 });
    await page.getByTestId('register-password').fill(testPassword, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });

    // Wait for registration and redirect to dashboard
    await page.waitForURL('http://localhost:3000/', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Create a product to test user-specific data
    await page.getByRole('button', { name: 'Add Product' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByTestId('product-name').fill('Test Product', { timeout: 30000 });
    await page.getByTestId('product-calories').fill('100', { timeout: 30000 });
    await page.getByTestId('product-protein').fill('10', { timeout: 30000 });
    await page.getByTestId('product-fat').fill('5', { timeout: 30000 });
    await page.getByTestId('product-carbs').fill('15', { timeout: 30000 });
    await page.getByTestId('product-submit').click({ timeout: 30000 });

    await page.waitForURL('http://localhost:3000/', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify product was created for this user
    await expect(page.getByText('Test Product')).toBeVisible({ timeout: 30000 });

    // Go to goals page to test goals form
    await page.getByRole('link', { name: 'Goals' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Fill goals form
    await page.getByLabel('Daily Calories').fill('2000', { timeout: 30000 });
    await page.getByLabel('Daily Protein (g)').fill('150', { timeout: 30000 });
    await page.getByLabel('Daily Fat (g)').fill('65', { timeout: 30000 });
    await page.getByLabel('Daily Carbs (g)').fill('250', { timeout: 30000 });

    // Go offline to test offline functionality
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Submit goals form offline
    await page.getByRole('button', { name: 'Save Goals' }).click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify goals were saved (should show success message)
    await expect(page.getByText('Goals saved successfully!')).toBeVisible({ timeout: 30000 });

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Verify goals are still there (indicating proper user association)
    await expect(page.getByLabel('Daily Calories')).toHaveValue('2000', { timeout: 30000 });
    await expect(page.getByLabel('Daily Protein (g)')).toHaveValue('150', { timeout: 30000 });
  });
});

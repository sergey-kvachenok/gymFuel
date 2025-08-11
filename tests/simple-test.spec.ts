import { test, expect } from '@playwright/test';

test.describe('Simple App Test', () => {
  test('should load the app homepage', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Should show the login page
    await expect(page.locator('text=Sign in')).toBeVisible();

    // Should have email and password fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Click register link
    await page.click('text=Register');

    // Should show the register page
    await expect(page.locator('text=Create account')).toBeVisible();

    // Should have registration fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

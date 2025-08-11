import { test, expect } from '@playwright/test';

const testUser = {
  email: `test-auth-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};

test.describe('Authentication', () => {
  test('should register and login successfully', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Try to register, but if it fails (user exists), just login
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

    // Verify we're on the dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });
  });
});

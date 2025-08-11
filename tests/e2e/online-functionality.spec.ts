import { test, expect } from '@playwright/test';

test.describe('Online Functionality', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the app with longer timeout
    await page.goto('http://localhost:3000', { timeout: 30000 });

    // Wait for the page to be stable (no more infinite re-renders)
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  test('should show login page on initial load', async ({ page }) => {
    // Wait for the login form to be visible and stable
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Should show the login page
    await expect(page.getByTestId('login-title')).toBeVisible({ timeout: 30000 });

    // Should have email and password fields
    await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('login-password')).toBeVisible({ timeout: 30000 });

    // Should have sign in button
    await expect(page.getByTestId('login-submit')).toBeVisible({ timeout: 30000 });

    // Should have register link
    await expect(page.getByTestId('login-register-link')).toBeVisible({ timeout: 30000 });
  });

  test('should navigate to register page', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Click register link
    await page.getByTestId('login-register-link').click({ timeout: 30000 });

    // Wait for navigation and page to be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should show the register page
    await expect(page.getByTestId('register-title')).toBeVisible({ timeout: 30000 });

    // Should have registration fields
    await expect(page.getByTestId('register-email')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('register-name')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('register-password')).toBeVisible({ timeout: 30000 });

    // Should have register button
    await expect(page.getByTestId('register-submit')).toBeVisible({ timeout: 30000 });

    // Should have login link
    await expect(page.getByTestId('register-login-link')).toBeVisible({ timeout: 30000 });
  });

  test('should register a new user', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Go to register page
    await page.getByTestId('login-register-link').click({ timeout: 30000 });

    // Wait for register page to load
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Fill registration form
    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });

    // Submit registration
    await page.getByTestId('register-submit').click({ timeout: 30000 });

    // Wait for redirect and page to be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 30000 });
  });

  test('should login successfully', async ({ page }) => {
    // Wait for the login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    // Go to register page first to create user
    await page.getByTestId('login-register-link').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Fill registration form
    await page.getByTestId('register-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('register-name').fill(testUser.name, { timeout: 30000 });
    await page.getByTestId('register-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('register-submit').click({ timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Now login
    await page.getByTestId('login-email').fill(testUser.email, { timeout: 30000 });
    await page.getByTestId('login-password').fill(testUser.password, { timeout: 30000 });
    await page.getByTestId('login-submit').click({ timeout: 30000 });

    // Wait for dashboard to load and be stable
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should be on dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });
  });

  test('should show dashboard navigation', async ({ page }) => {
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

    // Should show navigation links
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('nav-goals')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('nav-history')).toBeVisible({ timeout: 30000 });

    // Should show logout button
    await expect(page.getByTestId('logout-button')).toBeVisible({ timeout: 30000 });
  });

  test('should navigate to goals page', async ({ page }) => {
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

    // Navigate to goals
    await page.getByTestId('nav-goals').click({ timeout: 30000 });

    // Wait for goals page to load
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should be on goals page
    await expect(page).toHaveURL('http://localhost:3000/goals', { timeout: 30000 });
  });

  test('should navigate to history page', async ({ page }) => {
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

    // Navigate to history
    await page.getByTestId('nav-history').click({ timeout: 30000 });

    // Wait for history page to load
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should be on history page
    await expect(page).toHaveURL('http://localhost:3000/history', { timeout: 30000 });
  });
});

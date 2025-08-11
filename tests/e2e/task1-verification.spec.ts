import { test, expect } from '@playwright/test';
import { TEST_CONFIG, getRelativeUrl } from './test-config';

test.describe('Task 1 Verification - Fix Hardcoded User IDs', () => {
  test('should verify no hardcoded user IDs in console', async ({ page }) => {
    console.log('🧪 Verifying Task 1: No hardcoded user IDs');

    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Navigate to the app
    await page.goto(getRelativeUrl(), { timeout: TEST_CONFIG.TIMEOUTS.SHORT });
    console.log('✅ Page loaded successfully');

    // Wait a bit for any console messages
    await page.waitForTimeout(2000);

    // Check console for hardcoded user ID errors
    console.log('📋 Console messages found:', consoleMessages.length);

    const hardcodedErrors = consoleMessages.filter(
      (msg) => msg.includes('userId: 1') || msg.includes('userId: 0'),
    );

    console.log('🚨 Hardcoded user ID errors found:', hardcodedErrors.length);

    // This is the main test - should be 0 hardcoded errors
    expect(hardcodedErrors.length).toBe(0);

    console.log('✅ Task 1 PASSED: No hardcoded user ID errors found');
  });

  test('should verify app loads without database errors', async ({ page }) => {
    console.log('🧪 Verifying app loads properly');

    await page.goto(getRelativeUrl(), { timeout: TEST_CONFIG.TIMEOUTS.SHORT });

    // Check if the page loads without database errors
    const hasDatabaseError = (await page.locator("text=Can't reach database server").count()) > 0;

    expect(hasDatabaseError).toBe(false);
    console.log('✅ App loads without database errors');
  });
});

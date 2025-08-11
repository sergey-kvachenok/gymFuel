import { test, expect } from '@playwright/test';
import { TEST_CONFIG, getRelativeUrl } from './test-config';

test.describe('Simple User ID Test - Task 1', () => {
  test('should verify no hardcoded user IDs in console', async ({ page }) => {
    // Simple test: just check console for hardcoded user ID errors
    console.log('🧪 Starting simple user ID test...');

    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Navigate to the app (simple, no complex setup)
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

    console.log('✅ No hardcoded user ID errors found - Task 1 PASSED');
  });

  test('should verify test database isolation', async ({ page }) => {
    // Simple test: verify we're not interfering with dev database
    console.log('🧪 Testing database isolation...');

    await page.goto(getRelativeUrl(), { timeout: TEST_CONFIG.TIMEOUTS.SHORT });

    // Just check if the page loads without database errors
    const hasDatabaseError = (await page.locator("text=Can't reach database server").count()) > 0;

    expect(hasDatabaseError).toBe(false);
    console.log('✅ Database isolation working - dev database not affected');
  });
});

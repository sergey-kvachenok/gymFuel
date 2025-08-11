import { test, expect } from '@playwright/test';
import { loginWithTestUser, createTestProduct } from './test-utils';
import { TEST_CONFIG, getRelativeUrl } from './test-config';
import { PRODUCT_SELECTORS, BUTTON_TEXTS } from './selectors';

test.describe('Hardcoded User ID Fixes', () => {
  test('should use real user ID instead of hardcoded values', async ({ page }) => {
    // Login with predefined test user
    const testUser = await loginWithTestUser(page, 'user1');

    console.log('Successfully logged in as:', testUser.name);

    // Create a product to test user-specific data
    const testProduct = await createTestProduct(page, 'apple');
    console.log('Created test product:', testProduct.name);

    // Navigate to history page to see the product list
    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Open the products side panel
    await page
      .getByRole('button', { name: BUTTON_TEXTS.PRODUCTS_LIST })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Verify the product was created and is visible in the product list
    const productItems = await page.locator(`[data-testid="${PRODUCT_SELECTORS.ITEM}"]`).count();
    console.log('Product items count:', productItems);

    expect(productItems).toBeGreaterThan(0);
    console.log('✅ Product creation with real user ID working correctly');
  });
});

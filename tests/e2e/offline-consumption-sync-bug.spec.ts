import { test, expect } from '@playwright/test';

const testUser = {
  email: `test-offline-sync-bug-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};

test.describe('Offline Consumption Sync Bug', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page first
    await page.goto('http://localhost:3000/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

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

  test('should reproduce offline consumption sync bug - consumption list not updating', async ({
    page,
  }) => {
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

    // Check if we're actually offline
    const isOffline = await page.evaluate(() => navigator.onLine);
    console.log('DEBUG: Is page offline?', !isOffline);

    // Get initial consumption count (should be 0 for new user)
    const initialConsumptionCount = await page
      .locator('div:has-text("Today\'s Meals") .bg-gray-50:has-text("g →")')
      .count();
    console.log('DEBUG: Initial consumption count:', initialConsumptionCount);

    // Add a consumption while offline
    const addConsumptionButtons = await page
      .getByRole('button', { name: 'Add Consumption' })
      .count();
    console.log('DEBUG: Number of "Add Consumption" buttons found:', addConsumptionButtons);
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

    // Select the product
    await page.getByText('Select a product...').click({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.getByText('Test Apple').click({ timeout: 30000 });

    // Fill consumption form
    await page.getByTestId('consumption-amount').fill('100', { timeout: 30000 });

    // Check form state
    const amountValue = await page.getByTestId('consumption-amount').inputValue();
    console.log('DEBUG: Form state - amount:', amountValue);
    console.log('DEBUG: About to click submit button');

    // Check for JavaScript errors before clicking
    const errors = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).consoleErrors || [];
    });
    console.log('DEBUG: JavaScript errors before submit:', errors);

    // Check if React is working by looking for React components
    const reactComponents = await page.evaluate(() => {
      return document.querySelectorAll('[data-reactroot], [data-reactid]').length;
    });
    console.log('DEBUG: React components found:', reactComponents);

    await page.getByTestId('consumption-submit').click({ timeout: 30000 });
    console.log('DEBUG: Submit button clicked');

    // Wait for form to close and return to dashboard
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if consumption was added by looking at the page content
    const pageContent = await page.content();
    console.log('DEBUG: Page contains "Test Apple":', pageContent.includes('Test Apple'));
    console.log('DEBUG: Page contains "100g":', pageContent.includes('100g'));

    // Check if there are any consumption items visible
    const consumptionItems = await page.locator('div:has-text("g →")').count();
    console.log('DEBUG: Consumption items with "g →":', consumptionItems);

    // Check all elements with "Test Apple"
    const testAppleElements = await page.locator('div:has-text("Test Apple")').count();
    console.log('DEBUG: Elements containing "Test Apple":', testAppleElements);

    // Check if we're back on dashboard
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 30000 });

    // Wait a bit for any potential UI updates
    await page.waitForTimeout(2000);

    // Check consumption count after adding offline consumption
    const consumptionCountAfterAddition = await page
      .locator('div:has-text("Today\'s Meals") .bg-gray-50:has-text("g →")')
      .count();
    console.log('DEBUG: Consumption count after offline addition:', consumptionCountAfterAddition);

    // BUG: Consumption count should increase by 1, but it might not
    const expectedCount = initialConsumptionCount + 1;
    console.log('DEBUG: Expected consumption count:', expectedCount);
    console.log('DEBUG: Actual consumption count:', consumptionCountAfterAddition);
    console.log('DEBUG: Bug reproduced?', consumptionCountAfterAddition !== expectedCount);

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Check consumption count after going back online
    const consumptionCountAfterOnline = await page
      .locator('div:has-text("Today\'s Meals") .bg-gray-50')
      .count();
    console.log('DEBUG: Consumption count after going back online:', consumptionCountAfterOnline);

    // BUG: Consumption should sync when back online, but it might not
    console.log('DEBUG: Sync bug reproduced?', consumptionCountAfterOnline !== expectedCount);
  });

  test('should reproduce offline consumption sync bug - sync queue not working', async ({
    page,
  }) => {
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

    // Add multiple consumptions while offline
    const offlineConsumptions = [
      { product: 'Test Apple', amount: '100' },
      { product: 'Test Apple', amount: '150' },
    ];

    for (const consumption of offlineConsumptions) {
      await page.getByRole('button', { name: 'Add Consumption' }).click({ timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Select the product
      await page.getByText('Select a product...').click({ timeout: 30000 });
      await page.waitForTimeout(1000);
      await page.getByText(consumption.product).click({ timeout: 30000 });

      // Fill consumption form
      await page.getByTestId('consumption-amount').fill(consumption.amount, { timeout: 30000 });
      await page.getByTestId('consumption-submit').click({ timeout: 30000 });

      // Wait for form to close
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(1000);
    }

    // Check consumption count after adding offline consumptions
    const consumptionCountAfterOffline = await page
      .locator('[data-testid="consumption-item"]')
      .count();
    console.log('DEBUG: Consumption count after offline additions:', consumptionCountAfterOffline);

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(5000); // Wait longer for sync to complete

    // Check consumption count after going back online
    const consumptionCountAfterSync = await page
      .locator('[data-testid="consumption-item"]')
      .count();
    console.log('DEBUG: Consumption count after sync:', consumptionCountAfterSync);

    // BUG: All offline consumptions should be synced and visible
    const expectedCount = offlineConsumptions.length;
    console.log('DEBUG: Expected consumption count after sync:', expectedCount);
    console.log('DEBUG: Sync queue bug reproduced?', consumptionCountAfterSync !== expectedCount);
  });
});

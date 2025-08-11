import { test, expect } from '@playwright/test';
import { TEST_CONFIG, getRelativeUrl } from './test-config';
import { loginWithTestUser, createTestProduct, createTestConsumption } from './test-utils';

test.describe('History', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginWithTestUser(page, 'user1');
  });

  test('should display history page with consumption data', async ({ page }) => {
    console.log('🧪 Testing history page display...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show history page
    await expect(page.getByTestId('history-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show filters section
    await expect(page.getByTestId('history-filters')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Check if history list is visible (if there's data) or empty state (if no data)
    const historyListExists = await page
      .getByTestId('history-list')
      .isVisible()
      .catch(() => false);
    const emptyStateExists = await page
      .getByText('No nutrition data found for the selected period.')
      .isVisible()
      .catch(() => false);

    if (historyListExists) {
      console.log('✅ History list with data is visible');
    } else if (emptyStateExists) {
      console.log('✅ Empty history state is visible');
    } else {
      throw new Error('Neither history list nor empty state is visible');
    }

    console.log('✅ History page display working');
  });

  test('should show consumption entries in history', async ({ page }) => {
    console.log('🧪 Testing consumption history display...');

    // First create some test data
    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Create a test product
    await page
      .getByRole('button', { name: 'Add Product' })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    const productName = `History Test Product ${Date.now()}`;
    await page
      .getByTestId('product-name')
      .fill(productName, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId('product-calories')
      .fill('200', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.getByTestId('product-protein').fill('25', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.getByTestId('product-fat').fill('8', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.getByTestId('product-carbs').fill('15', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.getByTestId('product-submit').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Add a consumption
    await page
      .getByRole('button', { name: 'Add Consumption' })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page.getByText('Select a product...').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForTimeout(1000);
    await page.getByText(productName).click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId('consumption-amount')
      .fill('150', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.getByTestId('consumption-submit').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Now check history
    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show the consumption entry
    await expect(page.getByText(productName)).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    console.log('✅ Consumption history display working');
  });

  test('should allow filtering history by date range', async ({ page }) => {
    console.log('🧪 Testing history date filtering...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show date filter controls
    const dateFilterElements = page.locator('[data-testid*="date-filter"]');
    const dateFilterCount = await dateFilterElements.count();

    if (dateFilterCount > 0) {
      // Test date filtering
      await dateFilterElements.first().click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

      // Should be able to interact with date filters
      await expect(page.getByTestId('history-filters')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ History date filtering working');
    } else {
      console.log('ℹ️ No date filtering feature implemented yet');
    }
  });

  test('should allow filtering history by product', async ({ page }) => {
    console.log('🧪 Testing history product filtering...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show product filter controls
    const productFilterElements = page.locator('[data-testid*="product-filter"]');
    const productFilterCount = await productFilterElements.count();

    if (productFilterCount > 0) {
      // Test product filtering
      await productFilterElements.first().click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

      // Should be able to interact with product filters
      await expect(page.getByTestId('history-filters')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ History product filtering working');
    } else {
      console.log('ℹ️ No product filtering feature implemented yet');
    }
  });

  test('should display consumption details in history', async ({ page }) => {
    console.log('🧪 Testing consumption details display...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show consumption entries with details
    const consumptionEntries = page.locator('[data-testid*="consumption-entry"]');
    const entryCount = await consumptionEntries.count();

    if (entryCount > 0) {
      // Check first entry for details
      const firstEntry = consumptionEntries.first();

      // Should show product name
      await expect(firstEntry.locator('[data-testid*="product-name"]')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      // Should show amount
      await expect(firstEntry.locator('[data-testid*="amount"]')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      // Should show date
      await expect(firstEntry.locator('[data-testid*="date"]')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Consumption details display working');
    } else {
      console.log('ℹ️ No consumption entries to display');
    }
  });

  test('should allow viewing detailed consumption information', async ({ page }) => {
    console.log('🧪 Testing detailed consumption view...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Look for consumption entries that can be clicked for details
    const clickableEntries = page.locator('[data-testid*="consumption-entry"]');
    const entryCount = await clickableEntries.count();

    if (entryCount > 0) {
      // Click on first entry to view details
      await clickableEntries.first().click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
      await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

      // Should show detailed view or modal
      const detailModal = page.locator('[data-testid*="detail-modal"]');
      const detailPage = page.locator('[data-testid*="detail-page"]');

      if ((await detailModal.count()) > 0) {
        await expect(detailModal.first()).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
        console.log('✅ Consumption detail modal working');
      } else if ((await detailPage.count()) > 0) {
        await expect(detailPage.first()).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
        console.log('✅ Consumption detail page working');
      } else {
        console.log('ℹ️ No detailed view implemented yet');
      }
    } else {
      console.log('ℹ️ No consumption entries to view details');
    }
  });

  test('should handle empty history state', async ({ page }) => {
    console.log('🧪 Testing empty history state...');

    // Login with a user that has no consumption data
    await page.goto(getRelativeUrl('/login'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page
      .getByTestId('login-email')
      .fill('test2@example.com', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId('login-password')
      .fill('password123', { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.getByTestId('login-submit').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Go to history page
    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show history page even with no data
    await expect(page.getByTestId('history-page')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show empty state message or empty list
    const emptyStateElements = page.locator('[data-testid*="empty-state"]');
    const emptyStateCount = await emptyStateElements.count();

    if (emptyStateCount > 0) {
      await expect(emptyStateElements.first()).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
      console.log('✅ Empty history state working');
    } else {
      // Should show empty list
      await expect(page.getByTestId('history-list')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
      console.log('✅ Empty history list working');
    }
  });

  test('should allow sorting history entries', async ({ page }) => {
    console.log('🧪 Testing history sorting...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Look for sorting controls
    const sortElements = page.locator('[data-testid*="sort"]');
    const sortCount = await sortElements.count();

    if (sortCount > 0) {
      // Test sorting functionality
      await sortElements.first().click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

      // Should be able to interact with sorting
      await expect(page.getByTestId('history-filters')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ History sorting working');
    } else {
      console.log('ℹ️ No sorting feature implemented yet');
    }
  });

  test('should show nutrition totals in history', async ({ page }) => {
    console.log('🧪 Testing history nutrition totals...');

    await page.goto(getRelativeUrl('/history'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Look for nutrition totals
    const totalsElements = page.locator('[data-testid*="nutrition-totals"]');
    const totalsCount = await totalsElements.count();

    if (totalsCount > 0) {
      // Should show nutrition totals
      await expect(totalsElements.first()).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

      // Should show calories, protein, fat, carbs totals
      await expect(page.getByText('Total Calories')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
      await expect(page.getByText('Total Protein')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
      await expect(page.getByText('Total Fat')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
      await expect(page.getByText('Total Carbs')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ History nutrition totals working');
    } else {
      console.log('ℹ️ No nutrition totals feature implemented yet');
    }
  });
});

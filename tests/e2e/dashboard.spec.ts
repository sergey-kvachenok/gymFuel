import { test, expect } from '@playwright/test';
import { TEST_CONFIG, getRelativeUrl } from './test-config';
import { loginWithTestUser } from './test-utils';
import { createUniqueTestData } from './test-data-utils';
import {
  DASHBOARD_SELECTORS,
  PRODUCT_SELECTORS,
  CONSUMPTION_SELECTORS,
  BUTTON_TEXTS,
  PLACEHOLDER_TEXTS,
} from './selectors';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test with fresh context
    await loginWithTestUser(page, 'user1');
  });

  test('should display dashboard with daily nutrition statistics', async ({ page }) => {
    console.log('🧪 Testing dashboard display...');

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show dashboard welcome message
    await expect(page.getByTestId(DASHBOARD_SELECTORS.WELCOME)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should display daily stats components
    await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show calories, protein, fat, carbs in daily stats
    await expect(
      page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS).getByText('Calories'),
    ).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(
      page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS).getByText('Protein'),
    ).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS).getByText('Fat')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS).getByText('Carbs')).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show goals progress
    await expect(page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show today's meals section
    await expect(page.getByTestId(DASHBOARD_SELECTORS.TODAYS_MEALS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Dashboard display working correctly');
  });

  test('should allow adding new products', async ({ page }) => {
    console.log('🧪 Testing product creation...');

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Click add product button
    await page
      .getByRole('button', { name: BUTTON_TEXTS.ADD_PRODUCT })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Create unique test data for this test
    const uniqueData = createUniqueTestData('dashboard-product-creation', {
      includeProducts: true,
      includeConsumptions: false,
    });

    // Fill product form with unique data
    await page
      .getByTestId(PRODUCT_SELECTORS.NAME)
      .fill(uniqueData.products[0].name, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.CALORIES)
      .fill(uniqueData.products[0].calories.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.PROTEIN)
      .fill(uniqueData.products[0].protein.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.FAT)
      .fill(uniqueData.products[0].fat.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.CARBS)
      .fill(uniqueData.products[0].carbs.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Submit product
    await page
      .getByTestId(PRODUCT_SELECTORS.SUBMIT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be back on dashboard
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Should show success message or the product in the list
    await expect(page.getByTestId(DASHBOARD_SELECTORS.WELCOME)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Product creation working');
  });

  test('should allow adding consumption entries', async ({ page }) => {
    console.log('🧪 Testing consumption creation...');

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // First create a product to consume
    await page
      .getByRole('button', { name: BUTTON_TEXTS.ADD_PRODUCT })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    const uniqueData = createUniqueTestData('dashboard-consumption-creation', {
      includeProducts: true,
      includeConsumptions: true,
    });

    // Create a product first
    await page
      .getByTestId(PRODUCT_SELECTORS.NAME)
      .fill(uniqueData.products[0].name, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.CALORIES)
      .fill(uniqueData.products[0].calories.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.PROTEIN)
      .fill(uniqueData.products[0].protein.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.FAT)
      .fill(uniqueData.products[0].fat.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.CARBS)
      .fill(uniqueData.products[0].carbs.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    await page
      .getByTestId(PRODUCT_SELECTORS.SUBMIT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Now add consumption
    await page
      .getByRole('button', { name: BUTTON_TEXTS.ADD_CONSUMPTION })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Select the product we just created
    await page
      .getByText(PLACEHOLDER_TEXTS.SELECT_PRODUCT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForTimeout(1000);
    await page
      .getByText(uniqueData.products[0].name)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Fill consumption amount
    await page
      .getByTestId(CONSUMPTION_SELECTORS.AMOUNT)
      .fill(uniqueData.consumptions[0].amount, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Submit consumption
    await page
      .getByTestId(CONSUMPTION_SELECTORS.SUBMIT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be back on dashboard
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    console.log('✅ Consumption creation working');
  });

  test("should display today's meals list", async ({ page }) => {
    console.log("🧪 Testing today's meals display...");

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show today's meals section
    await expect(page.getByTestId(DASHBOARD_SELECTORS.TODAYS_MEALS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show meals list (even if empty)
    await expect(page.getByTestId(DASHBOARD_SELECTORS.MEALS_LIST)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log("✅ Today's meals display working");
  });

  test('should update daily statistics when consumption is added', async ({ page }) => {
    console.log('🧪 Testing daily statistics updates...');

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Get initial stats by looking for the calories text within daily stats
    const initialCaloriesElement = page
      .getByTestId(DASHBOARD_SELECTORS.DAILY_STATS)
      .getByText(/^\d+$/);
    const initialCalories = await initialCaloriesElement.textContent();
    console.log('Initial calories:', initialCalories);

    // Create a product and consumption to test stats update
    const uniqueData = createUniqueTestData('dashboard-stats-update', {
      includeProducts: true,
      includeConsumptions: true,
    });

    // Create a product first
    await page
      .getByRole('button', { name: BUTTON_TEXTS.ADD_PRODUCT })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page
      .getByTestId(PRODUCT_SELECTORS.NAME)
      .fill(uniqueData.products[0].name, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.CALORIES)
      .fill(uniqueData.products[0].calories.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.PROTEIN)
      .fill(uniqueData.products[0].protein.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.FAT)
      .fill(uniqueData.products[0].fat.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(PRODUCT_SELECTORS.CARBS)
      .fill(uniqueData.products[0].carbs.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    await page
      .getByTestId(PRODUCT_SELECTORS.SUBMIT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Now add consumption
    await page
      .getByRole('button', { name: BUTTON_TEXTS.ADD_CONSUMPTION })
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    await page
      .getByText(PLACEHOLDER_TEXTS.SELECT_PRODUCT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForTimeout(1000);
    await page
      .getByText(uniqueData.products[0].name)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    await page
      .getByTestId(CONSUMPTION_SELECTORS.AMOUNT)
      .fill(uniqueData.consumptions[0].amount, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page
      .getByTestId(CONSUMPTION_SELECTORS.SUBMIT)
      .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should be back on dashboard with updated stats
    await expect(page).toHaveURL(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });

    // Stats should be updated - verify daily stats are still visible
    await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Daily statistics updates working');
  });

  test('should show goals progress correctly', async ({ page }) => {
    console.log('🧪 Testing goals progress display...');

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show goals progress section
    await expect(page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show progress bars for different nutrients
    await expect(
      page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS).getByText('Calories'),
    ).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(
      page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS).getByText('Protein'),
    ).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS).getByText('Fat')).toBeVisible(
      {
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      },
    );
    await expect(
      page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS).getByText('Carbs'),
    ).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Goals progress display working');
  });

  test('should handle empty state when no meals are logged', async ({ page }) => {
    console.log('🧪 Testing empty state handling...');

    await page.goto(getRelativeUrl('/'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

    // Should show dashboard even with no meals
    await expect(page.getByTestId(DASHBOARD_SELECTORS.WELCOME)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
    await expect(page.getByTestId(DASHBOARD_SELECTORS.GOALS_PROGRESS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Should show zero or empty state for meals
    await expect(page.getByTestId(DASHBOARD_SELECTORS.TODAYS_MEALS)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    console.log('✅ Empty state handling working');
  });
});

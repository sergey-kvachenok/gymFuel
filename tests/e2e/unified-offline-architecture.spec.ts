import { test, expect } from '@playwright/test';
import { loginWithTestUser } from './test-utils';
import { createUniqueTestData } from './test-data-utils';
import { DASHBOARD_SELECTORS, UI_SELECTORS, PRODUCT_SELECTORS } from './selectors';
import { DashboardPage } from './page-objects/DashboardPage';
import { TEST_CONFIG } from './test-config';
import { TestTimeoutManager } from './test-timeout-manager';

test.describe('Unified Offline Architecture - Comprehensive Testing', () => {
  let dashboardPage: DashboardPage;
  let timeoutManager: TestTimeoutManager;

  test.beforeEach(async ({ page }) => {
    // Initialize timeout manager
    timeoutManager = new TestTimeoutManager({ maxTestTime: 120000 }); // 2 minute timeout

    // Login before each test
    await loginWithTestUser(page, 'user1');

    // Initialize page object
    dashboardPage = new DashboardPage(page);

    // Navigate to dashboard
    await dashboardPage.navigateToDashboard();
    await dashboardPage.waitForDashboardLoad();
  });

  test.afterEach(async () => {
    // Clean up timeout manager
    timeoutManager.cleanup();
  });

  test.describe('9.1 End-to-End Offline Scenarios', () => {
    test('should detect offline status and show appropriate UI indicators', async ({ page }) => {
      timeoutManager.startTest('offline status detection');

      console.log('🧪 Testing offline status detection...');

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for the app to detect offline mode
      await page.waitForTimeout(2000);

      // Check if offline banner appears
      const offlineBanner = page.locator(`[data-testid="${UI_SELECTORS.OFFLINE_BANNER}"]`);
      await expect(offlineBanner).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      // Verify banner content
      await expect(offlineBanner).toContainText('You are currently offline');

      console.log('✅ Offline status detection working correctly');
    });

    test('should maintain data consistency between online and offline modes', async ({ page }) => {
      timeoutManager.startTest('data consistency');

      console.log('🧪 Testing data consistency between online/offline modes...');

      // Create unique test data
      const testData = createUniqueTestData('data-consistency-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      // Create a product online
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();

      // Wait for product to be created and cached
      await page.waitForTimeout(3000);

      // Verify product appears in the list
      const productList = page.locator(`[data-testid="${PRODUCT_SELECTORS.LIST}"]`);
      await expect(productList).toContainText(testData.products[0].name);

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for offline detection
      await page.waitForTimeout(2000);

      // Verify product is still visible offline
      await expect(productList).toContainText(testData.products[0].name);

      // Go back online
      await page.context().setOffline(false);
      console.log('🌐 App is back online');

      // Wait for online detection
      await page.waitForTimeout(2000);

      // Verify product is still visible online
      await expect(productList).toContainText(testData.products[0].name);

      console.log('✅ Data consistency maintained across online/offline transitions');
    });
  });

  test.describe('9.2 CRUD Operations Offline', () => {
    test('should create products offline and sync when online', async ({ page }) => {
      timeoutManager.startTest('offline product creation');

      console.log('🧪 Testing offline product creation...');

      // Create unique test data
      const testData = createUniqueTestData('offline-product-creation', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      // Go offline first
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for offline detection
      await page.waitForTimeout(2000);

      // Create a product offline
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();

      // Wait for offline creation
      await page.waitForTimeout(2000);

      // Verify product appears in the list (offline)
      const productList = page.locator(`[data-testid="${PRODUCT_SELECTORS.LIST}"]`);
      await expect(productList).toContainText(testData.products[0].name);

      // Go back online
      await page.context().setOffline(false);
      console.log('🌐 App is back online');

      // Wait for sync to complete
      await page.waitForTimeout(5000);

      // Verify product is still visible after sync
      await expect(productList).toContainText(testData.products[0].name);

      console.log('✅ Offline product creation and sync working correctly');
    });

    test('should create consumptions offline and sync when online', async ({ page }) => {
      timeoutManager.startTest('offline consumption creation');

      console.log('🧪 Testing offline consumption creation...');

      // Create unique test data
      const testData = createUniqueTestData('offline-consumption-creation', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: true,
        includeGoals: false,
      });

      // Create a product first (online)
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();

      // Wait for product to be created
      await page.waitForTimeout(3000);

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for offline detection
      await page.waitForTimeout(2000);

      // Create a consumption offline
      await dashboardPage.clickAddConsumption();
      await dashboardPage.fillConsumptionForm(testData.consumptions[0]);
      await dashboardPage.submitConsumptionForm();

      // Wait for offline creation
      await page.waitForTimeout(2000);

      // Verify consumption appears in meals list
      const mealsList = page.locator(`[data-testid="${DASHBOARD_SELECTORS.MEALS_LIST}"]`);
      await expect(mealsList).toContainText(testData.products[0].name);

      // Go back online
      await page.context().setOffline(false);
      console.log('🌐 App is back online');

      // Wait for sync to complete
      await page.waitForTimeout(5000);

      // Verify consumption is still visible after sync
      await expect(mealsList).toContainText(testData.products[0].name);

      console.log('✅ Offline consumption creation and sync working correctly');
    });
  });

  test.describe('9.3 Background Sync Functionality', () => {
    test('should automatically sync when connection is restored', async ({ page }) => {
      timeoutManager.startTest('automatic background sync');

      console.log('🧪 Testing automatic background sync...');

      // Create unique test data
      const testData = createUniqueTestData('background-sync-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: true,
        includeGoals: false,
      });

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for offline detection
      await page.waitForTimeout(2000);

      // Create multiple items offline
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();

      await page.waitForTimeout(1000);

      await dashboardPage.clickAddConsumption();
      await dashboardPage.fillConsumptionForm(testData.consumptions[0]);
      await dashboardPage.submitConsumptionForm();

      await page.waitForTimeout(1000);

      // Verify items are created offline
      const productList = page.locator(`[data-testid="${DASHBOARD_SELECTORS.PRODUCT_LIST}"]`);
      const mealsList = page.locator(`[data-testid="${DASHBOARD_SELECTORS.MEALS_LIST}"]`);

      await expect(productList).toContainText(testData.products[0].name);
      await expect(mealsList).toContainText(testData.products[0].name);

      // Go back online
      await page.context().setOffline(false);
      console.log('🌐 App is back online');

      // Wait for background sync to complete
      await page.waitForTimeout(10000);

      // Verify items are still visible after sync
      await expect(productList).toContainText(testData.products[0].name);
      await expect(mealsList).toContainText(testData.products[0].name);

      console.log('✅ Automatic background sync working correctly');
    });
  });

  test.describe('9.4 Error Handling and Recovery', () => {
    test('should handle validation errors offline', async ({ page }) => {
      timeoutManager.startTest('offline validation errors');

      console.log('🧪 Testing offline validation errors...');

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for offline detection
      await page.waitForTimeout(2000);

      // Try to create product with invalid data
      await dashboardPage.clickAddProduct();

      // Submit without filling required fields
      await page.click('[data-testid="save-product-button"]');

      // Wait for validation
      await page.waitForTimeout(1000);

      // Verify validation error is shown
      const errorMessage = page.locator(`[data-testid="${UI_SELECTORS.ERROR_MESSAGE}"]`);
      await expect(errorMessage).toBeVisible();

      // Verify error message content
      await expect(errorMessage).toContainText('Please fill in all required fields');

      console.log('✅ Offline validation error handling working correctly');
    });
  });

  test.describe('9.5 Performance and Memory Management', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      timeoutManager.startTest('large dataset handling');

      console.log('🧪 Testing large dataset handling...');

      // Create multiple products to test performance
      const products = [];
      for (let i = 0; i < 5; i++) {
        products.push({
          name: `Performance Test Product ${i}`,
          calories: 100 + i,
          protein: 10 + i,
          fat: 5 + i,
          carbs: 20 + i,
        });
      }

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Wait for offline detection
      await page.waitForTimeout(2000);

      // Create multiple products
      for (const product of products) {
        await dashboardPage.clickAddProduct();
        await dashboardPage.fillProductForm(product);
        await dashboardPage.submitProductForm();
        await page.waitForTimeout(500); // Small delay between creations
      }

      // Verify all products are created
      const productList = page.locator(`[data-testid="${DASHBOARD_SELECTORS.PRODUCT_LIST}"]`);
      for (const product of products) {
        await expect(productList).toContainText(product.name);
      }

      // Go back online
      await page.context().setOffline(false);
      console.log('🌐 App is back online');

      // Wait for all products to sync
      await page.waitForTimeout(10000);

      // Verify all products are still visible after sync
      for (const product of products) {
        await expect(productList).toContainText(product.name);
      }

      console.log('✅ Large dataset handling working correctly');
    });
  });
});

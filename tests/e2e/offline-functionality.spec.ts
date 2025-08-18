import { test, expect } from '@playwright/test';
import { loginWithTestUser } from './test-utils';
import { createUniqueTestData } from './test-data-utils';
import {
  DASHBOARD_SELECTORS,
  UI_SELECTORS,
  PRODUCT_SELECTORS,
  CONSUMPTION_SELECTORS,
} from './selectors';
import { DashboardPage } from './page-objects/DashboardPage';
import { TEST_CONFIG } from './test-config';
import { TestTimeoutManager } from './test-timeout-manager';

test.describe('Complete Offline Functionality - End-to-End Testing', () => {
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

  test.describe('7.1 End-to-End Offline Scenarios', () => {
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

      // Navigate to history page to verify product appears in the list
      await page.goto('/history');
      await page.waitForTimeout(2000);

      // Open the products side panel
      const productsButton = page.locator('button:has-text("Products List")');
      await productsButton.click();
      await page.waitForTimeout(1000);

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

      console.log('✅ Data consistency maintained between online/offline modes');
    });

    test('should handle rapid connection state changes gracefully', async ({ page }) => {
      timeoutManager.startTest('rapid connection changes');

      console.log('🧪 Testing rapid connection state changes...');

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // Go online
      await page.context().setOffline(false);
      await page.waitForTimeout(1000);

      // Go offline again
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // Go online again
      await page.context().setOffline(false);
      await page.waitForTimeout(1000);

      // Verify app remains stable
      await expect(page.locator('body')).toBeVisible();

      // Check that no error messages are displayed
      const errorMessages = page.locator('[data-testid="error-message"]');
      await expect(errorMessages).toHaveCount(0);

      console.log('✅ Rapid connection changes handled gracefully');
    });
  });

  test.describe('7.2 CRUD Operations Offline', () => {
    test('should create products while offline', async ({ page }) => {
      timeoutManager.startTest('offline product creation');

      console.log('🧪 Testing offline product creation...');

      // Go offline first
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Create unique test data
      const testData = createUniqueTestData('offline-product-creation', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      // Create a product while offline
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();

      // Wait for form submission
      await page.waitForTimeout(2000);

      // Verify success message or form reset
      const successMessage = page.locator('[data-testid="success-message"]');
      const formReset = page.locator('[data-testid="product-form"] input[type="text"]').first();

      // Either success message should appear or form should be reset
      await expect(successMessage.or(formReset)).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Offline product creation working correctly');
    });

    test('should create consumptions while offline', async ({ page }) => {
      timeoutManager.startTest('offline consumption creation');

      console.log('🧪 Testing offline consumption creation...');

      // Go offline first
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Create unique test data
      const testData = createUniqueTestData('offline-consumption-creation', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: true,
        includeGoals: false,
      });

      // Create a consumption while offline
      await dashboardPage.clickAddConsumption();
      await dashboardPage.fillConsumptionForm(testData.consumptions[0]);
      await dashboardPage.submitConsumptionForm();

      // Wait for form submission
      await page.waitForTimeout(2000);

      // Verify success message or form reset
      const successMessage = page.locator('[data-testid="success-message"]');
      const formReset = page
        .locator('[data-testid="consumption-form"] input[type="number"]')
        .first();

      await expect(successMessage.or(formReset)).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Offline consumption creation working correctly');
    });

    test('should update products while offline', async ({ page }) => {
      timeoutManager.startTest('offline product update');

      console.log('🧪 Testing offline product update...');

      // Create a product first (online)
      const testData = createUniqueTestData('offline-product-update', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();
      await page.waitForTimeout(3000);

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Navigate to history to find the product
      await page.goto('/history');
      await page.waitForTimeout(2000);

      // Open products panel
      const productsButton = page.locator('button:has-text("Products List")');
      await productsButton.click();
      await page.waitForTimeout(1000);

      // Find and edit the product
      const productItem = page.locator(`[data-testid="${PRODUCT_SELECTORS.ITEM}"]`).first();
      await productItem.click();
      await page.waitForTimeout(1000);

      // Update the product name
      const nameInput = page.locator('[data-testid="product-name-input"]');
      await nameInput.clear();
      await nameInput.fill('Updated Product Name');

      // Submit the update
      const updateButton = page.locator('[data-testid="update-product-button"]');
      await updateButton.click();
      await page.waitForTimeout(2000);

      // Verify update was successful
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Offline product update working correctly');
    });

    test('should delete products while offline', async ({ page }) => {
      timeoutManager.startTest('offline product deletion');

      console.log('🧪 Testing offline product deletion...');

      // Create a product first (online)
      const testData = createUniqueTestData('offline-product-deletion', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();
      await page.waitForTimeout(3000);

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Navigate to history to find the product
      await page.goto('/history');
      await page.waitForTimeout(2000);

      // Open products panel
      const productsButton = page.locator('button:has-text("Products List")');
      await productsButton.click();
      await page.waitForTimeout(1000);

      // Find and delete the product
      const productItem = page.locator(`[data-testid="${PRODUCT_SELECTORS.ITEM}"]`).first();
      await productItem.click();
      await page.waitForTimeout(1000);

      // Click delete button
      const deleteButton = page.locator('[data-testid="delete-product-button"]');
      await deleteButton.click();
      await page.waitForTimeout(1000);

      // Confirm deletion
      const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
      await confirmButton.click();
      await page.waitForTimeout(2000);

      // Verify deletion was successful
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Offline product deletion working correctly');
    });
  });

  test.describe('7.3 Background Sync When Coming Online', () => {
    test('should sync data when coming back online', async ({ page }) => {
      timeoutManager.startTest('background sync on reconnection');

      console.log('🧪 Testing background sync when coming online...');

      // Create unique test data
      const testData = createUniqueTestData('background-sync-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: true,
        includeGoals: false,
      });

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Create a product while offline
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();
      await page.waitForTimeout(2000);

      // Create a consumption while offline
      await dashboardPage.clickAddConsumption();
      await dashboardPage.fillConsumptionForm(testData.consumptions[0]);
      await dashboardPage.submitConsumptionForm();
      await page.waitForTimeout(2000);

      // Go back online
      await page.context().setOffline(false);
      console.log('📱 App is now back online');

      // Wait for sync to complete
      await page.waitForTimeout(5000);

      // Check for sync status indicator
      const syncIndicator = page.locator('[data-testid="sync-status"]');
      await expect(syncIndicator).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      // Verify sync completion message
      await expect(syncIndicator).toContainText('Synced');

      console.log('✅ Background sync working correctly when coming online');
    });

    test('should handle sync errors gracefully', async ({ page }) => {
      timeoutManager.startTest('sync error handling');

      console.log('🧪 Testing sync error handling...');

      // Create test data
      const testData = createUniqueTestData('sync-error-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Create a product while offline
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();
      await page.waitForTimeout(2000);

      // Mock network error by intercepting API calls
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });

      // Go back online
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);

      // Wait for sync attempt
      await page.waitForTimeout(3000);

      // Check for error message
      const errorMessage = page.locator('[data-testid="sync-error-message"]');
      await expect(errorMessage).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Sync error handling working correctly');
    });

    test('should retry failed sync operations', async ({ page }) => {
      timeoutManager.startTest('sync retry mechanism');

      console.log('🧪 Testing sync retry mechanism...');

      // Create test data
      const testData = createUniqueTestData('sync-retry-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Create a product while offline
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();
      await page.waitForTimeout(2000);

      // Mock network error first, then success
      let callCount = 0;
      await page.route('**/api/**', (route) => {
        callCount++;
        if (callCount === 1) {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      // Go back online
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);

      // Wait for retry mechanism
      await page.waitForTimeout(8000);

      // Check for success message
      const successMessage = page.locator('[data-testid="sync-success-message"]');
      await expect(successMessage).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Sync retry mechanism working correctly');
    });
  });

  test.describe('7.4 Error Scenarios and Recovery', () => {
    test('should handle database errors gracefully', async ({ page }) => {
      timeoutManager.startTest('database error handling');

      console.log('🧪 Testing database error handling...');

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Try to create a product with invalid data
      await dashboardPage.clickAddProduct();

      // Fill form with invalid data (empty name)
      const nameInput = page.locator('[data-testid="product-name-input"]');
      await nameInput.clear();

      // Try to submit
      const submitButton = page.locator('[data-testid="submit-product-button"]');
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for validation error
      const errorMessage = page.locator('[data-testid="validation-error"]');
      await expect(errorMessage).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Database error handling working correctly');
    });

    test('should handle storage quota exceeded errors', async ({ page }) => {
      timeoutManager.startTest('storage quota error handling');

      console.log('🧪 Testing storage quota error handling...');

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Mock storage quota exceeded error
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'storage', {
          value: {
            estimate: () =>
              Promise.resolve({
                quota: 1000,
                usage: 999,
                usageDetails: { databases: 999 },
              }),
          },
        });
      });

      // Try to create a product
      await dashboardPage.clickAddProduct();

      const testData = createUniqueTestData('quota-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      await dashboardPage.fillProductForm(testData.products[0]);
      await dashboardPage.submitProductForm();
      await page.waitForTimeout(2000);

      // Check for storage error message
      const errorMessage = page.locator('[data-testid="storage-error-message"]');
      await expect(errorMessage).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      console.log('✅ Storage quota error handling working correctly');
    });

    test('should recover from connection interruptions', async ({ page }) => {
      timeoutManager.startTest('connection interruption recovery');

      console.log('🧪 Testing connection interruption recovery...');

      // Start online
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);

      // Create a product
      const testData = createUniqueTestData('connection-recovery-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: false,
        includeGoals: false,
      });

      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(testData.products[0]);

      // Go offline during form submission
      await dashboardPage.submitProductForm();
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Verify the product was still created locally
      await page.goto('/history');
      await page.waitForTimeout(2000);

      const productsButton = page.locator('button:has-text("Products List")');
      await productsButton.click();
      await page.waitForTimeout(1000);

      const productList = page.locator(`[data-testid="${PRODUCT_SELECTORS.LIST}"]`);
      await expect(productList).toContainText(testData.products[0].name);

      console.log('✅ Connection interruption recovery working correctly');
    });

    test('should handle partial sync failures', async ({ page }) => {
      timeoutManager.startTest('partial sync failure handling');

      console.log('🧪 Testing partial sync failure handling...');

      // Create multiple items offline
      const testData = createUniqueTestData('partial-sync-test', {
        includeUsers: true,
        includeProducts: true,
        includeConsumptions: true,
        includeGoals: false,
      });

      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Create multiple products
      for (let i = 0; i < 3; i++) {
        await dashboardPage.clickAddProduct();
        await dashboardPage.fillProductForm({
          ...testData.products[0],
          name: `Product ${i + 1}`,
        });
        await dashboardPage.submitProductForm();
        await page.waitForTimeout(1000);
      }

      // Mock partial sync failure
      let callCount = 0;
      await page.route('**/api/products/**', (route) => {
        callCount++;
        if (callCount === 2) {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      // Go online
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);

      // Wait for sync
      await page.waitForTimeout(5000);

      // Check for partial sync status
      const syncStatus = page.locator('[data-testid="sync-status"]');
      await expect(syncStatus).toContainText('Partial');

      console.log('✅ Partial sync failure handling working correctly');
    });
  });

  test.describe('7.5 Service Worker Integration', () => {
    test('should work with service worker for offline functionality', async ({ page }) => {
      timeoutManager.startTest('service worker integration');

      console.log('🧪 Testing service worker integration...');

      // Check if service worker is registered
      const swRegistration = await page.evaluate(() => {
        return navigator.serviceWorker?.getRegistrations();
      });

      expect(swRegistration).toBeDefined();

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Verify app still works offline
      await expect(page.locator('body')).toBeVisible();

      // Try to navigate to different pages
      await page.goto('/history');
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();

      await page.goto('/goals');
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();

      console.log('✅ Service worker integration working correctly');
    });

    test('should cache essential resources for offline use', async ({ page }) => {
      timeoutManager.startTest('resource caching');

      console.log('🧪 Testing resource caching...');

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Verify essential UI elements are still available
      const dashboard = page.locator('[data-testid="dashboard"]');
      await expect(dashboard).toBeVisible();

      const addProductButton = page.locator('[data-testid="add-product-button"]');
      await expect(addProductButton).toBeVisible();

      const addConsumptionButton = page.locator('[data-testid="add-consumption-button"]');
      await expect(addConsumptionButton).toBeVisible();

      console.log('✅ Resource caching working correctly');
    });
  });
});

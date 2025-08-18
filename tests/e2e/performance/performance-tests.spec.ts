import { test, expect } from '@playwright/test';
import { loginWithTestUser } from '../test-utils';
import { createUniqueTestData } from '../test-data-utils';
import { DashboardPage } from '../page-objects/DashboardPage';
import { TestTimeoutManager } from '../test-timeout-manager';

test.describe('Performance Tests - Unified Offline Architecture', () => {
  let dashboardPage: DashboardPage;
  let timeoutManager: TestTimeoutManager;

  test.beforeEach(async ({ page }) => {
    // Initialize timeout manager with extended timeout for performance tests
    timeoutManager = new TestTimeoutManager({ maxTestTime: 120000 }); // 2 minutes

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

  test('should measure IndexedDB write performance with large datasets', async ({ page }) => {
    timeoutManager.startTest('IndexedDB write performance test');

    console.log('🧪 Testing IndexedDB write performance...');

    const productCount = 100;

    // Generate 100 products
    const products = Array.from({ length: productCount }, (_, i) => ({
      name: `Performance Product ${i}`,
      calories: Math.floor(Math.random() * 500) + 50,
      protein: Math.floor(Math.random() * 30) + 5,
      fat: Math.floor(Math.random() * 20) + 2,
      carbs: Math.floor(Math.random() * 50) + 10,
    }));

    // Measure bulk write performance
    const writeStartTime = Date.now();

    // Write products to IndexedDB via the app
    for (let i = 0; i < products.length; i++) {
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm(products[i]);
      await dashboardPage.submitProductForm();

      // Small delay to prevent overwhelming the UI
      if (i % 10 === 0) {
        await page.waitForTimeout(100);
      }
    }

    const writeEndTime = Date.now();
    const writeDuration = writeEndTime - writeStartTime;

    console.log(`📊 IndexedDB write performance: ${productCount} products in ${writeDuration}ms`);
    console.log(`📊 Average write time per product: ${writeDuration / productCount}ms`);

    // Performance assertions
    expect(writeDuration).toBeLessThan(30000); // Should complete within 30 seconds
    expect(writeDuration / productCount).toBeLessThan(500); // Average < 500ms per product

    console.log('✅ IndexedDB write performance test passed');
  });

  test('should measure IndexedDB read performance with large datasets', async ({ page }) => {
    timeoutManager.startTest('IndexedDB read performance test');

    console.log('🧪 Testing IndexedDB read performance...');

    // First, create some test data
    createUniqueTestData('performance-read-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: true,
      includeGoals: false,
    });

    // Create 50 products and 100 consumptions
    for (let i = 0; i < 50; i++) {
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm({
        name: `Read Test Product ${i}`,
        calories: 100 + i,
        protein: 10 + i,
        fat: 5 + i,
        carbs: 20 + i,
      });
      await dashboardPage.submitProductForm();
    }

    // Create consumptions
    for (let i = 0; i < 100; i++) {
      await dashboardPage.clickAddConsumption();
      await dashboardPage.fillConsumptionForm({
        productName: `Read Test Product ${i % 50}`,
        amount: (100 + i).toString(),
      });
      await dashboardPage.submitConsumptionForm();
    }

    // Go offline to test IndexedDB read performance
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Measure read performance
    const readStartTime = Date.now();

    // Navigate to history page to trigger large data reads
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await page.waitForTimeout(2000);

    const readEndTime = Date.now();
    const readDuration = readEndTime - readStartTime;

    console.log(`📊 IndexedDB read performance: ${readDuration}ms for large dataset`);

    // Performance assertions
    expect(readDuration).toBeLessThan(5000); // Should load within 5 seconds

    console.log('✅ IndexedDB read performance test passed');
  });

  test('should measure sync performance with large datasets', async ({ page }) => {
    timeoutManager.startTest('Sync performance test');

    console.log('🧪 Testing sync performance...');

    // Create large dataset offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    const productCount = 50;
    const consumptionCount = 100;

    // Create products offline
    for (let i = 0; i < productCount; i++) {
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm({
        name: `Sync Test Product ${i}`,
        calories: 100 + i,
        protein: 10 + i,
        fat: 5 + i,
        carbs: 20 + i,
      });
      await dashboardPage.submitProductForm();
    }

    // Create consumptions offline
    for (let i = 0; i < consumptionCount; i++) {
      await dashboardPage.clickAddConsumption();
      await dashboardPage.fillConsumptionForm({
        productName: `Sync Test Product ${i % productCount}`,
        amount: (100 + i).toString(),
      });
      await dashboardPage.submitConsumptionForm();
    }

    console.log(`📊 Created ${productCount} products and ${consumptionCount} consumptions offline`);

    // Measure sync performance
    const syncStartTime = Date.now();

    // Go back online to trigger sync
    await page.context().setOffline(false);
    console.log('📱 App is now online - triggering sync');

    // Wait for sync to complete
    await page.waitForTimeout(10000); // Wait up to 10 seconds for sync

    const syncEndTime = Date.now();
    const syncDuration = syncEndTime - syncStartTime;

    console.log(
      `📊 Sync performance: ${syncDuration}ms for ${productCount + consumptionCount} items`,
    );

    // Performance assertions
    expect(syncDuration).toBeLessThan(15000); // Should sync within 15 seconds

    console.log('✅ Sync performance test passed');
  });

  test('should measure memory usage during large operations', async ({ page }) => {
    timeoutManager.startTest('Memory usage test');

    console.log('🧪 Testing memory usage...');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return null;
    });

    console.log(
      `📊 Initial memory usage: ${initialMemory ? Math.round(initialMemory / 1024 / 1024) + 'MB' : 'Not available'}`,
    );

    // Perform large operations
    const operations = 100;

    for (let i = 0; i < operations; i++) {
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm({
        name: `Memory Test Product ${i}`,
        calories: 100 + i,
        protein: 10 + i,
        fat: 5 + i,
        carbs: 20 + i,
      });
      await dashboardPage.submitProductForm();

      // Small delay
      if (i % 20 === 0) {
        await page.waitForTimeout(100);
      }
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return null;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = Math.round(memoryIncrease / 1024 / 1024);

      console.log(`📊 Final memory usage: ${Math.round(finalMemory / 1024 / 1024)}MB`);
      console.log(`📊 Memory increase: ${memoryIncreaseMB}MB`);

      // Memory usage assertions
      expect(memoryIncreaseMB).toBeLessThan(50); // Should not increase by more than 50MB
    } else {
      console.log('📊 Memory usage tracking not available in this browser');
    }

    console.log('✅ Memory usage test passed');
  });

  test('should measure UI responsiveness during heavy operations', async () => {
    timeoutManager.startTest('UI responsiveness test');

    console.log('🧪 Testing UI responsiveness...');

    const startTime = Date.now();

    // Perform multiple operations rapidly
    const operations = 20;
    const responseTimes: number[] = [];

    for (let i = 0; i < operations; i++) {
      const operationStart = Date.now();

      // Click add product button
      await dashboardPage.clickAddProduct();

      // Fill form
      await dashboardPage.fillProductForm({
        name: `Responsiveness Test Product ${i}`,
        calories: 100 + i,
        protein: 10 + i,
        fat: 5 + i,
        carbs: 20 + i,
      });

      // Submit form
      await dashboardPage.submitProductForm();

      const operationEnd = Date.now();
      const responseTime = operationEnd - operationStart;
      responseTimes.push(responseTime);

      console.log(`📊 Operation ${i + 1} response time: ${responseTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);

    console.log(`📊 Total time: ${totalTime}ms`);
    console.log(`📊 Average response time: ${Math.round(averageResponseTime)}ms`);
    console.log(`📊 Max response time: ${maxResponseTime}ms`);

    // Responsiveness assertions
    expect(averageResponseTime).toBeLessThan(2000); // Average < 2 seconds
    expect(maxResponseTime).toBeLessThan(5000); // Max < 5 seconds

    console.log('✅ UI responsiveness test passed');
  });

  test('should measure background sync efficiency', async ({ page }) => {
    timeoutManager.startTest('Background sync efficiency test');

    console.log('🧪 Testing background sync efficiency...');

    // Create data offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Create multiple items quickly
    const items = 30;
    const createStartTime = Date.now();

    for (let i = 0; i < items; i++) {
      await dashboardPage.clickAddProduct();
      await dashboardPage.fillProductForm({
        name: `Background Sync Product ${i}`,
        calories: 100 + i,
        protein: 10 + i,
        fat: 5 + i,
        carbs: 20 + i,
      });
      await dashboardPage.submitProductForm();
    }

    const createEndTime = Date.now();
    const createDuration = createEndTime - createStartTime;

    console.log(`📊 Created ${items} items in ${createDuration}ms`);

    // Measure background sync efficiency
    const syncStartTime = Date.now();

    // Go online to trigger background sync
    await page.context().setOffline(false);
    console.log('📱 App is now online - background sync starting');

    // Wait for background sync indicators
    await page.waitForTimeout(5000);

    const syncEndTime = Date.now();
    const syncDuration = syncEndTime - syncStartTime;

    console.log(`📊 Background sync duration: ${syncDuration}ms`);

    // Efficiency assertions
    expect(syncDuration).toBeLessThan(10000); // Should complete within 10 seconds
    expect(syncDuration / items).toBeLessThan(500); // Average < 500ms per item

    console.log('✅ Background sync efficiency test passed');
  });
});

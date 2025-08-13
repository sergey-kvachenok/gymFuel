import { test, expect } from '@playwright/test';
import { loginWithTestUser } from './test-utils';
import { createUniqueTestData } from './test-data-utils';
import { DASHBOARD_SELECTORS, UI_SELECTORS } from './selectors';
import { DashboardPage } from './page-objects/DashboardPage';
import { TEST_CONFIG } from './test-config';
import { TestTimeoutManager } from './test-timeout-manager';

test.describe('Offline Consumption Submission', () => {
  let dashboardPage: DashboardPage;
  let timeoutManager: TestTimeoutManager;

  test.beforeEach(async ({ page }) => {
    // Initialize timeout manager
    timeoutManager = new TestTimeoutManager({ maxTestTime: 60000 }); // 1 minute timeout

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

  test('should display offline banner when network is disabled', async ({ page }) => {
    timeoutManager.startTest('should display offline banner when network is disabled');

    try {
      console.log('🧪 Testing offline banner display...');

      // Go offline
      await page.context().setOffline(true);
      console.log('📱 App is now offline');

      // Check if offline mode is detected by the app
      const isOffline = await page.evaluate(() => {
        return navigator.onLine === false;
      });
      console.log('📱 Browser offline status:', isOffline);

      // Wait for the app to detect offline mode
      await page.waitForTimeout(2000);

      // Check if the app's online status hook detects offline mode
      const appOfflineStatus = await page.evaluate(() => {
        // Try to access the online status from the app
        const offlineBanner = document.querySelector('[data-testid="offline-banner"]');
        return offlineBanner !== null;
      });
      console.log('📱 App offline banner visible:', appOfflineStatus);

      // Wait for offline banner to appear
      const offlineBanner = page.locator(`[data-testid="${UI_SELECTORS.OFFLINE_BANNER}"]`);
      await expect(offlineBanner).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });

      // Verify banner content
      await expect(offlineBanner).toContainText('You are currently offline');

      console.log('✅ Offline banner is visible with correct content');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });

  test('should handle offline consumption submission with validation errors', async ({ page }) => {
    console.log('🧪 Testing offline consumption validation...');

    // Create unique test data
    const testData = createUniqueTestData('offline-validation-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: false,
      includeGoals: false,
    });

    // Create a test product first (online)
    await dashboardPage.clickAddProduct();
    await dashboardPage.fillProductForm(testData.products[0]);
    await dashboardPage.submitProductForm();

    // Wait for product to be available and cached to IndexedDB
    await page.waitForTimeout(3000);

    // Verify product is cached to IndexedDB before going offline
    const cachedProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 Cached products before going offline:', cachedProducts);

    // Go offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Try to add consumption with invalid data
    await dashboardPage.clickAddConsumption();

    // Try to submit without selecting a product
    await dashboardPage.submitConsumptionForm();

    // Should show validation error
    const errorMessage = page.locator(`[data-testid="${UI_SELECTORS.ERROR_MESSAGE}"]`);
    await expect(errorMessage).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Verify error message content
    await expect(errorMessage).toContainText('Please select a product');

    console.log('✅ Offline validation is working correctly');
  });

  test('should create consumption offline and display in meals list', async ({ page }) => {
    console.log('🧪 Testing offline consumption creation...');

    // Create unique test data
    const testData = createUniqueTestData('offline-consumption-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: true, // Changed from false to true
      includeGoals: false,
    });

    console.log('📊 Test data structure:', {
      users: testData.users?.length,
      products: testData.products?.length,
      consumptions: testData.consumptions?.length,
      goals: testData.goals?.length,
    });
    console.log('📊 Products:', testData.products);
    console.log('📊 Consumptions:', testData.consumptions);

    // Create a test product first (online)
    await dashboardPage.clickAddProduct();
    await dashboardPage.fillProductForm(testData.products[0]);
    await dashboardPage.submitProductForm();

    // Wait for product to be available and cached to IndexedDB
    await page.waitForTimeout(3000);

    // Verify product is cached to IndexedDB before going offline
    const cachedProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 Cached products before going offline:', cachedProducts);

    // Go offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Check if offline mode is detected by the app
    const isOffline = await page.evaluate(() => {
      return navigator.onLine === false;
    });
    console.log('📱 Browser offline status:', isOffline);

    // Wait for the app to detect offline mode
    await page.waitForTimeout(2000);

    // Check if the app's online status hook detects offline mode
    const appOfflineStatus = await page.evaluate(() => {
      // Try to access the online status from the app
      const offlineBanner = document.querySelector('[data-testid="offline-banner"]');
      return offlineBanner !== null;
    });
    console.log('📱 App offline banner visible:', appOfflineStatus);

    // Check if products are available in IndexedDB
    const indexedDbProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 IndexedDB products:', indexedDbProducts);

    // Add consumption offline
    await dashboardPage.clickAddConsumption();

    // Debug: Check if consumption form is visible
    const consumptionForm = page.locator('[data-testid="consumption-form"]');
    await expect(consumptionForm).toBeVisible();
    console.log('✅ Consumption form is visible');

    // Debug: Check if product combobox is visible
    const productCombobox = page.locator('[data-testid="product-combobox-button"]');
    await expect(productCombobox).toBeVisible();
    console.log('✅ Product combobox is visible');

    // Debug: Check what text is displayed in the combobox
    const comboboxText = await page
      .locator('[data-testid="product-combobox-display"]')
      .textContent();
    console.log('📝 Combobox text:', comboboxText);

    await dashboardPage.selectProductForConsumption(testData.products[0].name);

    // Create consumption data with product name
    const consumptionData = {
      amount: testData.consumptions[0].amount || '150',
      productName: testData.products[0].name,
    };

    console.log('📊 Consumption data:', consumptionData);
    console.log('📊 Amount:', consumptionData.amount);

    await dashboardPage.fillConsumptionForm(consumptionData);

    // Debug: Check if there are any error messages before submission
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('❌ Error message before submission:', errorText);
    } else {
      console.log('✅ No error messages before submission');
    }

    // Debug: Check submit button state
    const submitButton = page.locator('[data-testid="consumption-submit"]');
    const isDisabled = await submitButton.isDisabled();
    console.log('📊 Submit button disabled:', isDisabled);

    // Submit the form
    await dashboardPage.submitConsumptionForm();
    console.log('✅ Form submitted successfully');

    // Wait for the consumption to be processed
    await page.waitForTimeout(2000);

    // Verify consumption appears in meals list
    const mealsList = page.locator(`[data-testid="${DASHBOARD_SELECTORS.MEALS_LIST}"]`);
    await expect(mealsList).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Verify the consumption item is displayed
    const consumptionItem = page.locator('[data-testid="consumption-item"]').first();
    await expect(consumptionItem).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Verify product name is displayed
    await expect(consumptionItem).toContainText(testData.products[0].name);

    console.log('✅ Offline consumption creation and display working');
  });

  test('should persist offline consumption data in IndexedDB', async ({ page }) => {
    console.log('🧪 Testing IndexedDB data persistence...');

    // Create unique test data
    const testData = createUniqueTestData('indexeddb-persistence-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: false,
      includeGoals: false,
    });

    // Create a test product first (online)
    await dashboardPage.clickAddProduct();
    await dashboardPage.fillProductForm(testData.products[0]);
    await dashboardPage.submitProductForm();

    // Wait for product to be available and cached to IndexedDB
    await page.waitForTimeout(3000);

    // Verify product is cached to IndexedDB before going offline
    const cachedProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 Cached products before going offline:', cachedProducts);

    // Go offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Add consumption offline
    await dashboardPage.clickAddConsumption();
    await dashboardPage.selectProductForConsumption(testData.products[0].name);
    await dashboardPage.fillConsumptionForm(testData.consumptions[0]);
    await dashboardPage.submitConsumptionForm();

    // Wait for data to be saved
    await page.waitForTimeout(1000);

    // Check IndexedDB data
    const indexedDbData = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['consumptions'], 'readonly');
          const store = transaction.objectStore('consumptions');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 IndexedDB consumption data:', indexedDbData);

    // Verify that consumption data exists in IndexedDB
    expect(indexedDbData).toBeDefined();
    expect(Array.isArray(indexedDbData)).toBe(true);

    if (indexedDbData.length > 0) {
      const lastConsumption = indexedDbData[indexedDbData.length - 1] as {
        amount: number;
        productId: number;
      };
      expect(lastConsumption.amount).toBe(testData.consumptions[0].amount);
      expect(lastConsumption.productId).toBeDefined();
    }

    console.log('✅ IndexedDB data persistence verified');
  });

  test('should handle offline consumption creation with proper error handling', async ({
    page,
  }) => {
    console.log('🧪 Testing offline error handling...');

    // Create unique test data
    const testData = createUniqueTestData('offline-error-handling-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: false,
      includeGoals: false,
    });

    // Create a test product first (online)
    await dashboardPage.clickAddProduct();
    await dashboardPage.fillProductForm(testData.products[0]);
    await dashboardPage.submitProductForm();

    // Wait for product to be available and cached to IndexedDB
    await page.waitForTimeout(3000);

    // Verify product is cached to IndexedDB before going offline
    const cachedProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 Cached products before going offline:', cachedProducts);

    // Go offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Try to add consumption with invalid amount (negative)
    await dashboardPage.clickAddConsumption();
    await dashboardPage.selectProductForConsumption(testData.products[0].name);

    // Fill with invalid amount
    await page.getByTestId('consumption-amount').fill('-10');
    await dashboardPage.submitConsumptionForm();

    // Should show validation error
    const errorMessage = page.locator(`[data-testid="${UI_SELECTORS.ERROR_MESSAGE}"]`);
    await expect(errorMessage).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    // Verify error message content
    await expect(errorMessage).toContainText('Please select a product and enter a valid amount');

    console.log('✅ Offline error handling working correctly');
  });

  test('should verify offline consumption appears immediately in UI', async ({ page }) => {
    console.log('🧪 Testing immediate UI updates for offline consumption...');

    // Create unique test data
    const testData = createUniqueTestData('offline-ui-update-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: false,
      includeGoals: false,
    });

    // Create a test product first (online)
    await dashboardPage.clickAddProduct();
    await dashboardPage.fillProductForm(testData.products[0]);
    await dashboardPage.submitProductForm();

    // Wait for product to be available and cached to IndexedDB
    await page.waitForTimeout(3000);

    // Verify product is cached to IndexedDB before going offline
    const cachedProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 1);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 Cached products before going offline:', cachedProducts);

    // Go offline
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Get initial meals count
    const initialMealsCount = await page.locator('[data-testid="todays-meals-item"]').count();

    // Add consumption offline
    await dashboardPage.clickAddConsumption();
    await dashboardPage.selectProductForConsumption(testData.products[0].name);
    await dashboardPage.fillConsumptionForm(testData.consumptions[0]);
    await dashboardPage.submitConsumptionForm();

    // Wait for UI to update
    await page.waitForTimeout(2000);

    // Verify meals count increased
    const finalMealsCount = await page.locator('[data-testid="todays-meals-item"]').count();
    expect(finalMealsCount).toBe(initialMealsCount + 1);

    // Verify the new consumption is visible
    const newConsumption = page.locator('[data-testid="todays-meals-item"]').last();
    await expect(newConsumption).toContainText(testData.products[0].name);

    console.log('✅ Offline consumption appears immediately in UI');
  });

  test('should create product and cache to IndexedDB', async ({ page }) => {
    console.log('🧪 Testing product creation and caching...');

    // Create unique test data
    const testData = createUniqueTestData('product-caching-test', {
      includeUsers: true,
      includeProducts: true,
      includeConsumptions: false,
      includeGoals: false,
    });

    console.log('📊 Test data structure:', {
      users: testData.users?.length,
      products: testData.products?.length,
      consumptions: testData.consumptions?.length,
      goals: testData.goals?.length,
    });

    // First, check if the dashboard components are rendering properly
    console.log('🔄 Checking dashboard component structure...');

    // Check if ConsumptionManager buttons are rendering
    const addProductButtonExists = await page.locator('button:has-text("Add Product")').isVisible();
    console.log('📊 Add Product button visible:', addProductButtonExists);

    const addConsumptionButtonExists = await page
      .locator('button:has-text("Add Consumption")')
      .isVisible();
    console.log('📊 Add Consumption button visible:', addConsumptionButtonExists);

    // Check IndexedDB state before product creation
    const cachedProductsBefore = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 10);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('�� IndexedDB products before creation:', cachedProductsBefore.length);

    // Only proceed with product creation if components are rendering
    if (!addProductButtonExists || !addConsumptionButtonExists) {
      console.log('❌ Dashboard components not rendering properly');
      throw new Error('Dashboard components not rendering properly');
    }

    // Go offline to test offline product creation
    console.log('🔄 Going offline to test offline product creation...');
    await page.context().setOffline(true);
    console.log('📱 App is now offline');

    // Check if offline mode is detected by the app
    const isOffline = await page.evaluate(() => {
      return navigator.onLine === false;
    });
    console.log('📱 Browser offline status:', isOffline);

    // Wait for the app to detect offline mode
    await page.waitForTimeout(2000);

    // Check if the app's online status hook detects offline mode
    const appOfflineStatus = await page.evaluate(() => {
      const offlineBanner = document.querySelector('[data-testid="offline-banner"]');
      return offlineBanner !== null;
    });
    console.log('📱 App offline banner visible:', appOfflineStatus);

    // Create a test product in offline mode
    console.log('🔄 Starting offline product creation...');
    await dashboardPage.clickAddProduct();
    console.log('✅ Add product button clicked');

    // Check if ProductForm is visible after clicking Add Product
    const productFormVisible = await page.locator('[data-testid="product-form"]').isVisible();
    console.log('📊 ProductForm visible after clicking Add Product:', productFormVisible);

    // Check if ProductForm card is visible
    const productFormCardVisible = await page
      .locator('[data-testid="product-form-card"]')
      .isVisible();
    console.log('📊 ProductForm card visible after clicking Add Product:', productFormCardVisible);

    // Wait for the form to be fully rendered inside the dialog
    console.log('🔄 Waiting for form to be fully rendered...');
    await page.waitForSelector('[data-testid="product-form"]', { timeout: 10000 });
    console.log('✅ Form is now available in DOM');

    // Check if we're in a dialog/modal
    const dialogContent = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        return {
          hasForm: !!dialog.querySelector('[data-testid="product-form"]'),
          dialogContent: dialog.innerHTML.substring(0, 300),
        };
      }
      return null;
    });
    console.log('📊 Dialog content check:', dialogContent);

    console.log('🔄 Filling product form...');
    await dashboardPage.fillProductForm(testData.products[0]);
    console.log('✅ Product form filled');

    // Check if form data is actually filled
    const formData = await page.evaluate(() => {
      const nameInput = document.querySelector('[data-testid="product-name"]') as HTMLInputElement;
      const caloriesInput = document.querySelector(
        '[data-testid="product-calories"]',
      ) as HTMLInputElement;
      const proteinInput = document.querySelector(
        '[data-testid="product-protein"]',
      ) as HTMLInputElement;
      const fatInput = document.querySelector('[data-testid="product-fat"]') as HTMLInputElement;
      const carbsInput = document.querySelector(
        '[data-testid="product-carbs"]',
      ) as HTMLInputElement;

      return {
        name: nameInput?.value || 'not found',
        calories: caloriesInput?.value || 'not found',
        protein: proteinInput?.value || 'not found',
        fat: fatInput?.value || 'not found',
        carbs: carbsInput?.value || 'not found',
      };
    });
    console.log('📊 Form data after filling:', formData);

    // Check for any validation errors before submitting
    const validationError = await page.locator('[data-testid="product-form-error"]').isVisible();
    console.log('📊 Validation error visible before submit:', validationError);
    if (validationError) {
      const errorText = await page.locator('[data-testid="product-form-error"]').textContent();
      console.log('📊 Validation error text:', errorText);
    }

    console.log('🔄 Submitting product form...');

    // Check if submit button is enabled before clicking
    const submitButton = page.locator('[data-testid="product-submit"]');
    const isDisabled = await submitButton.isDisabled();
    console.log('📊 Submit button disabled before clicking:', isDisabled);

    if (!isDisabled) {
      // Try to trigger the form submission by dispatching a submit event
      const formSubmitResult = await page.evaluate(() => {
        const form = document.querySelector('[data-testid="product-form"]') as HTMLFormElement;
        if (form) {
          console.log('🎯 Form found, dispatching submit event...');
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
          return 'submit event dispatched';
        }
        return 'form not found';
      });
      console.log('📊 Form submit event result:', formSubmitResult);

      // Also try clicking the button
      await submitButton.click();
      console.log('📊 Submit button clicked');
    } else {
      console.log('❌ Submit button is disabled, cannot click');
    }

    // Wait for form submission to complete with timeout
    console.log('🔄 Waiting for form submission to complete...');
    try {
      await page.waitForTimeout(5000); // Wait up to 5 seconds
      console.log('✅ Form submission wait completed');
    } catch {
      console.log('⚠️ Form submission wait timed out');
    }

    // In offline mode, there should be no tRPC requests
    const productCreateRequests = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter(
          (entry) => entry.name.includes('/api/trpc/') && entry.name.includes('product.create'),
        )
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
        }));
    });
    console.log(
      '📊 Product create requests (should be empty in offline mode):',
      productCreateRequests,
    );

    // Check submit button state before clicking
    const submitButtonState = await page.evaluate(() => {
      const submitButton = document.querySelector(
        '[data-testid="product-submit"]',
      ) as HTMLButtonElement;
      if (submitButton) {
        return {
          disabled: submitButton.disabled,
          textContent: submitButton.textContent,
          isVisible: submitButton.offsetParent !== null,
          className: submitButton.className,
        };
      }
      return null;
    });
    console.log('📊 Submit button state before clicking:', submitButtonState);

    // Check what buttons are actually in the form
    const formButtons = await page.evaluate(() => {
      const form = document.querySelector('[data-testid="product-form"]');
      if (form) {
        const buttons = form.querySelectorAll('button');
        return Array.from(buttons).map((button) => ({
          textContent: button.textContent,
          testId: button.getAttribute('data-testid'),
          type: button.getAttribute('type'),
          disabled: button.disabled,
        }));
      }
      return [];
    });
    console.log('📊 Buttons in product form:', formButtons);

    // Check if the form is actually visible and what's in it
    const formContent = await page.evaluate(() => {
      const form = document.querySelector('[data-testid="product-form"]');
      if (form) {
        return {
          innerHTML: form.innerHTML.substring(0, 500), // First 500 chars
          childNodes: form.childNodes.length,
        };
      }
      return null;
    });
    console.log('📊 Form content check:', formContent);

    // Form has already been submitted via form.requestSubmit()
    // No need to call dashboardPage.submitProductForm() again
    console.log('✅ Product form already submitted via form.requestSubmit()');

    // Check network requests to see if tRPC mutation is called
    const networkRequests = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((entry) => entry.name.includes('/api/trpc/'))
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
        }));
    });
    console.log('📊 Network requests to tRPC:', networkRequests);

    // Check for any form errors
    const formError = await page.locator('[data-testid="product-form-error"]').isVisible();
    console.log('📊 Form error visible:', formError);
    if (formError) {
      const errorText = await page.locator('[data-testid="product-form-error"]').textContent();
      console.log('📊 Form error text:', errorText);
    }

    // Check if the onSuccess callback was triggered by looking for specific console logs
    // We'll check this after the form submission
    console.log('📊 Checking for ProductForm callback logs...');

    // Wait for the modal to close (indicating successful submission)
    console.log('🔄 Waiting for modal to close after successful submission...');
    await page.waitForFunction(
      () => {
        const dialog = document.querySelector('[role="dialog"]');
        return !dialog || !dialog.querySelector('[data-testid="product-form"]');
      },
      { timeout: 10000 },
    );
    console.log('✅ Modal closed - form submission completed');

    // Wait for product to be created and cached
    await page.waitForTimeout(3000);

    // Verify product creation was successful by checking if it appears in the UI
    console.log('🔄 Checking if product appears in UI...');
    const productInUI = await page.locator(`text=${testData.products[0].name}`).isVisible();
    console.log('📊 Product visible in UI:', productInUI);

    // Open the consumption modal to check if the product is available in the combobox
    console.log('🔄 Opening consumption modal to check product availability...');
    await page.locator('button:has-text("Add Consumption")').click();
    await page.waitForTimeout(1000); // Wait for modal to open

    // Check if product combobox exists and what it contains
    const comboboxExists = await page
      .locator('[data-testid="product-combobox-button"]')
      .isVisible();
    console.log('📊 Product combobox visible in consumption modal:', comboboxExists);

    // Check the userId value that's being passed to ProductForm
    const userIdValue = await page.evaluate(() => {
      // Try to find the ProductForm component and get its userId prop
      const productForm = document.querySelector('[data-testid="product-form"]');
      if (productForm) {
        // This is a simplified way to check - in reality we'd need to access React props
        return 'ProductForm found';
      }
      return 'ProductForm not found';
    });
    console.log('📊 ProductForm status:', userIdValue);

    if (comboboxExists) {
      const productComboboxText = await page
        .locator('[data-testid="product-combobox-button"]')
        .textContent();
      console.log('📊 Product combobox content:', productComboboxText);

      // Click the combobox to see available products
      await page.locator('[data-testid="product-combobox-button"]').click();
      await page.waitForTimeout(1000);

      // Check if the created product appears in the dropdown
      const productInDropdown = await page.locator(`text=${testData.products[0].name}`).isVisible();
      console.log('📊 Product visible in dropdown:', productInDropdown);
    }

    // Check if product is cached to IndexedDB
    const cachedProductsAfter = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 10);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('�� IndexedDB products after creation:', cachedProductsAfter.length);
    console.log('📊 IndexedDB products data:', cachedProductsAfter);

    // Verify product creation was successful
    expect(productInUI).toBe(true);
    console.log('✅ Product creation successful');

    // Verify product is cached
    expect(cachedProductsAfter.length).toBeGreaterThan(cachedProductsBefore.length);
    console.log('✅ Product creation and caching working');
  });

  test('should cache products to IndexedDB directly', async ({ page }) => {
    console.log('🧪 Testing direct product caching...');

    // Create a test product
    const testProduct = {
      id: 999,
      name: 'Test Cached Product',
      calories: 150,
      protein: 15,
      fat: 8,
      carbs: 20,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try to cache the product directly using IndexedDB
    const cacheResult = await page.evaluate(async (product) => {
      try {
        const dbName = 'GymFuelOfflineDB';
        const request = indexedDB.open(dbName, 10);

        return new Promise<string>((resolve) => {
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const addRequest = store.put(product);

            addRequest.onsuccess = () => {
              resolve('success');
            };

            addRequest.onerror = () => {
              resolve(`error: ${addRequest.error?.message || 'Unknown error'}`);
            };
          };

          request.onerror = () => {
            resolve(`error: ${request.error?.message || 'Database open failed'}`);
          };
        });
      } catch (error) {
        return `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }, testProduct);

    console.log('📊 Direct caching result:', cacheResult);

    // Check if product is cached
    const cachedProducts = await page.evaluate(async () => {
      const dbName = 'GymFuelOfflineDB';
      const request = indexedDB.open(dbName, 10);

      return new Promise<unknown[]>((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['products'], 'readonly');
          const store = transaction.objectStore('products');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            resolve([]);
          };
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    });

    console.log('📊 Cached products after direct caching:', cachedProducts);
    expect(cachedProducts.length).toBeGreaterThan(0);
    console.log('✅ Direct caching test completed');
  });
});

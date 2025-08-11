import { Page, expect } from '@playwright/test';
import { TEST_CONFIG, getRelativeUrl } from './test-config';
import {
  AUTH_SELECTORS,
  BUTTON_TEXTS,
  PLACEHOLDER_TEXTS,
  CONSUMPTION_SELECTORS,
} from './selectors';

// Test utilities for consistent test data and helper functions

export const TEST_USERS = {
  user1: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    id: 1,
  },
  user2: {
    email: 'test2@example.com',
    password: 'password123',
    name: 'Test User 2',
    id: 2,
  },
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    name: 'Admin User',
    id: 3,
  },
} as const;

export const TEST_PRODUCTS = {
  apple: {
    name: 'Test Apple',
    calories: 52,
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
  },
  banana: {
    name: 'Test Banana',
    calories: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 23,
  },
  chicken: {
    name: 'Test Chicken Breast',
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
  },
} as const;

/**
 * Helper function to create unique test data for isolation
 * @deprecated Use createUniqueTestData from './test-data-utils' instead
 */
import { TestDataFactory } from './test-data-factory';

export function createUniqueTestData() {
  const product = TestDataFactory.createProduct();
  const consumption = TestDataFactory.createConsumption();

  return {
    product,
    consumption,
  };
}

export const TEST_GOALS = {
  default: {
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyFat: 65,
    dailyCarbs: 250,
    goalType: 'Maintain' as const,
  },
} as const;

/**
 * Helper function to login with a test user
 * This function ensures proper test isolation by using a fresh page context
 */
export async function loginWithTestUser(page: Page, user: keyof typeof TEST_USERS = 'user1') {
  const testUser = TEST_USERS[user];

  console.log(`Logging in as ${testUser.email}...`);

  // Always start fresh by going to the login page
  await page.goto(getRelativeUrl('/login'), { timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION });
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

  // Clear any existing form data
  await page
    .getByTestId(AUTH_SELECTORS.LOGIN_EMAIL)
    .clear({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId(AUTH_SELECTORS.LOGIN_PASSWORD)
    .clear({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

  // Login with test user
  await page
    .getByTestId(AUTH_SELECTORS.LOGIN_EMAIL)
    .fill(testUser.email, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId(AUTH_SELECTORS.LOGIN_PASSWORD)
    .fill(testUser.password, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId(AUTH_SELECTORS.LOGIN_SUBMIT)
    .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

  // Wait for redirect to dashboard
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: TEST_CONFIG.TIMEOUTS.ACTION,
  });

  // Wait for dashboard to load
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

  // Verify we're on the dashboard
  await expect(page.getByTestId('dashboard-welcome')).toBeVisible({
    timeout: TEST_CONFIG.TIMEOUTS.ACTION,
  });

  console.log('Successfully logged in and redirected to dashboard');
  return testUser;
}

/**
 * Helper function to create a test product
 */
export async function createTestProduct(page: Page, product: keyof typeof TEST_PRODUCTS = 'apple') {
  const testProduct = TEST_PRODUCTS[product];

  await page
    .getByRole('button', { name: BUTTON_TEXTS.ADD_PRODUCT })
    .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

  await page
    .getByTestId('product-name')
    .fill(testProduct.name, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId('product-calories')
    .fill(testProduct.calories.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId('product-protein')
    .fill(testProduct.protein.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId('product-fat')
    .fill(testProduct.fat.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId('product-carbs')
    .fill(testProduct.carbs.toString(), { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page.getByTestId('product-submit').click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

  return testProduct;
}

/**
 * Helper function to create a test consumption
 */
export async function createTestConsumption(
  page: Page,
  productName: string,
  amount: string = '100',
) {
  await page
    .getByRole('button', { name: BUTTON_TEXTS.ADD_CONSUMPTION })
    .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });

  // Select the product
  await page
    .getByText(PLACEHOLDER_TEXTS.SELECT_PRODUCT)
    .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page.waitForTimeout(1000);
  await page.getByText(productName).first().click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

  // Fill consumption form
  await page
    .getByTestId(CONSUMPTION_SELECTORS.AMOUNT)
    .fill(amount, { timeout: TEST_CONFIG.TIMEOUTS.ACTION });
  await page
    .getByTestId(CONSUMPTION_SELECTORS.SUBMIT)
    .click({ timeout: TEST_CONFIG.TIMEOUTS.ACTION });

  await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
}

/**
 * Helper function to wait for database operations
 */
export async function waitForDatabaseOperation(
  page: Page,
  timeout: number = TEST_CONFIG.WAIT_TIMES.DATABASE_OPERATION,
) {
  await page.waitForTimeout(timeout);
}

/**
 * Helper function to check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: TEST_CONFIG.TIMEOUTS.SHORT });
    return true;
  } catch {
    return false;
  }
}

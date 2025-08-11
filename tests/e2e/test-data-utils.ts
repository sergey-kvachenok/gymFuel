import { Page } from '@playwright/test';
import {
  TestDataFactory,
  TestUser,
  TestProduct,
  TestConsumption,
  TestGoals,
} from './test-data-factory';
import { testDataManager } from './test-data-manager';
import { TEST_CONFIG } from './test-config';

/**
 * Standardized test data utilities for consistent data management
 */

/**
 * Create unique test data for a specific test
 * This replaces the old createUniqueTestData function
 */
export function createUniqueTestData(
  testName: string,
  options: {
    includeUsers?: boolean;
    includeProducts?: boolean;
    includeConsumptions?: boolean;
    includeGoals?: boolean;
    scenarios?: ('breakfast' | 'lunch' | 'dinner' | 'daily')[];
  } = {},
) {
  const {
    includeUsers = true,
    includeProducts = true,
    includeConsumptions = true,
    includeGoals = false,
    scenarios = [],
  } = options;

  return testDataManager.createTestData(testName, {
    users: includeUsers ? 1 : 0,
    products: includeProducts ? 2 : 0,
    consumptions: includeConsumptions ? 3 : 0,
    goals: includeGoals ? 1 : 0,
    scenarios,
  });
}

/**
 * Create realistic test scenarios for comprehensive testing
 */
export function createRealisticTestScenarios(testName: string) {
  return testDataManager.createRealisticScenarios(testName);
}

/**
 * Create edge case test data for boundary testing
 */
export function createEdgeCaseTestData(testName: string) {
  return testDataManager.createEdgeCaseData(testName);
}

/**
 * Create performance test data for load testing
 */
export function createPerformanceTestData(
  testName: string,
  size: 'small' | 'medium' | 'large' = 'medium',
) {
  return testDataManager.createPerformanceTestData(testName, size);
}

/**
 * Create a single test user with optional overrides
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return TestDataFactory.createUser(overrides);
}

/**
 * Create a single test product with optional overrides
 */
export function createTestProduct(overrides: Partial<TestProduct> = {}): TestProduct {
  return TestDataFactory.createProduct(overrides);
}

/**
 * Create a single test consumption with optional overrides
 */
export function createTestConsumption(overrides: Partial<TestConsumption> = {}): TestConsumption {
  return TestDataFactory.createConsumption(overrides);
}

/**
 * Create a single test goal with optional overrides
 */
export function createTestGoal(overrides: Partial<TestGoals> = {}): TestGoals {
  return TestDataFactory.createGoals(overrides);
}

/**
 * Create multiple test users
 */
export function createMultipleTestUsers(
  count: number,
  overrides: Partial<TestUser> = {},
): TestUser[] {
  return TestDataFactory.createMultipleUsers(count, overrides);
}

/**
 * Create multiple test products
 */
export function createMultipleTestProducts(
  count: number,
  overrides: Partial<TestProduct> = {},
): TestProduct[] {
  return TestDataFactory.createMultipleProducts(count, overrides);
}

/**
 * Create multiple test consumptions
 */
export function createMultipleTestConsumptions(
  count: number,
  overrides: Partial<TestConsumption> = {},
): TestConsumption[] {
  return TestDataFactory.createMultipleConsumptions(count, overrides);
}

/**
 * Create multiple test goals
 */
export function createMultipleTestGoals(
  count: number,
  overrides: Partial<TestGoals> = {},
): TestGoals[] {
  return TestDataFactory.createMultipleGoals(count, overrides);
}

/**
 * Create a breakfast meal scenario
 */
export function createBreakfastScenario() {
  return TestDataFactory.createBreakfastScenario();
}

/**
 * Create a lunch meal scenario
 */
export function createLunchScenario() {
  return TestDataFactory.createLunchScenario();
}

/**
 * Create a dinner meal scenario
 */
export function createDinnerScenario() {
  return TestDataFactory.createDinnerScenario();
}

/**
 * Create a complete daily meal plan
 */
export function createDailyMealPlan() {
  return TestDataFactory.createDailyMealPlan();
}

/**
 * Create weight loss goals
 */
export function createWeightLossGoals(): TestGoals {
  return TestDataFactory.createWeightLossGoals();
}

/**
 * Create weight gain goals
 */
export function createWeightGainGoals(): TestGoals {
  return TestDataFactory.createWeightGainGoals();
}

/**
 * Create maintenance goals
 */
export function createMaintenanceGoals(): TestGoals {
  return TestDataFactory.createMaintenanceGoals();
}

/**
 * Create a product and consumption pair for testing
 */
export function createProductConsumptionPair(): {
  product: TestProduct;
  consumption: TestConsumption;
} {
  const product = createTestProduct();
  const consumption = createTestConsumption({
    productName: product.name,
  });

  return { product, consumption };
}

/**
 * Create a complete user profile with goals
 */
export function createCompleteUserProfile(): {
  user: TestUser;
  goals: TestGoals;
  products: TestProduct[];
  consumptions: TestConsumption[];
} {
  const user = createTestUser();
  const goals = createMaintenanceGoals();
  const products = createMultipleTestProducts(3);
  const consumptions = createMultipleTestConsumptions(5);

  return { user, goals, products, consumptions };
}

/**
 * Create test data for dashboard testing
 */
export function createDashboardTestData(testName: string) {
  return testDataManager.createTestData(testName, {
    users: 1,
    products: 5,
    consumptions: 10,
    goals: 1,
    scenarios: ['breakfast', 'lunch', 'dinner'],
  });
}

/**
 * Create test data for goals testing
 */
export function createGoalsTestData(testName: string) {
  return testDataManager.createTestData(testName, {
    users: 1,
    products: 0,
    consumptions: 0,
    goals: 3, // Multiple goals for testing different types
    scenarios: [],
  });
}

/**
 * Create test data for history testing
 */
export function createHistoryTestData(testName: string) {
  return testDataManager.createTestData(testName, {
    users: 1,
    products: 10,
    consumptions: 50, // More consumptions for history testing
    goals: 1,
    scenarios: ['daily'],
  });
}

/**
 * Create test data for authentication testing
 */
export function createAuthenticationTestData(testName: string) {
  return testDataManager.createTestData(testName, {
    users: 3, // Multiple users for authentication testing
    products: 0,
    consumptions: 0,
    goals: 0,
    scenarios: [],
  });
}

/**
 * Create test data for navigation testing
 */
export function createNavigationTestData(testName: string) {
  return testDataManager.createTestData(testName, {
    users: 1,
    products: 2,
    consumptions: 3,
    goals: 1,
    scenarios: ['breakfast'],
  });
}

/**
 * Clean up test data for a specific test
 */
export async function cleanupTestData(testName: string, page: Page): Promise<void> {
  await testDataManager.cleanupTestData(testName, page);
}

/**
 * Clean up all test data
 */
export async function cleanupAllTestData(page: Page): Promise<void> {
  await testDataManager.cleanupAllTestData(page);
}

/**
 * Get test data statistics
 */
export function getTestDataStats() {
  return testDataManager.getTestDataStats();
}

/**
 * Reset test data manager
 */
export function resetTestDataManager(): void {
  testDataManager.reset();
}

/**
 * Validate test data integrity
 */
export function validateTestData(data: {
  users?: TestUser[];
  products?: TestProduct[];
  consumptions?: TestConsumption[];
  goals?: TestGoals[];
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate users
  if (data.users) {
    for (const user of data.users) {
      if (!TestDataFactory['validateTestUser'](user)) {
        errors.push(`Invalid user data: ${user.email}`);
      }
    }
  }

  // Validate products
  if (data.products) {
    for (const product of data.products) {
      if (!TestDataFactory['validateTestProduct'](product)) {
        errors.push(`Invalid product data: ${product.name}`);
      }
    }
  }

  // Validate consumptions
  if (data.consumptions) {
    for (const consumption of data.consumptions) {
      if (!TestDataFactory['validateTestConsumption'](consumption)) {
        errors.push(`Invalid consumption data: ${consumption.amount}`);
      }
    }
  }

  // Validate goals
  if (data.goals) {
    for (const goal of data.goals) {
      if (!TestDataFactory['validateTestGoals'](goal)) {
        errors.push(`Invalid goal data: ${goal.dailyCalories}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Print test data statistics
 */
export function printTestDataStats(): void {
  const stats = getTestDataStats();

  console.log('\n📊 Test Data Statistics:');
  console.log(`Total Tests: ${stats.totalTests}`);
  console.log(`Total Products: ${stats.totalProducts}`);
  console.log(`Total Consumptions: ${stats.totalConsumptions}`);
  console.log(`Total Goals: ${stats.totalGoals}`);
  console.log(`Cache Size: ${stats.cacheSize}`);
  console.log('');
}

// Export commonly used test data patterns
export const TEST_DATA_PATTERNS = {
  // Basic patterns
  BASIC_USER: () => createTestUser(),
  BASIC_PRODUCT: () => createTestProduct(),
  BASIC_CONSUMPTION: () => createTestConsumption(),
  BASIC_GOAL: () => createTestGoal(),

  // Meal patterns
  BREAKFAST: () => createBreakfastScenario(),
  LUNCH: () => createLunchScenario(),
  DINNER: () => createDinnerScenario(),
  DAILY_MEAL_PLAN: () => createDailyMealPlan(),

  // Goal patterns
  WEIGHT_LOSS: () => createWeightLossGoals(),
  WEIGHT_GAIN: () => createWeightGainGoals(),
  MAINTENANCE: () => createMaintenanceGoals(),

  // Complex patterns
  PRODUCT_CONSUMPTION_PAIR: () => createProductConsumptionPair(),
  COMPLETE_USER_PROFILE: () => createCompleteUserProfile(),
} as const;

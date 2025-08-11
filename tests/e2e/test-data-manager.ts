import { Page } from '@playwright/test';
import {
  TestDataFactory,
  TestUser,
  TestProduct,
  TestConsumption,
  TestGoals,
} from './test-data-factory';
import { configManager } from './config/environment-config';

/**
 * Test data lifecycle management
 */
export interface TestDataLifecycle {
  userId?: number;
  productIds: number[];
  consumptionIds: number[];
  goalIds: number[];
  createdAt: Date;
  testName: string;
}

/**
 * Test data manager for comprehensive data lifecycle management
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private lifecycles: Map<string, TestDataLifecycle> = new Map();
  private testDataCache: Map<string, any> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Create test data for a specific test
   */
  public createTestData(
    testName: string,
    options: {
      users?: number;
      products?: number;
      consumptions?: number;
      goals?: number;
      scenarios?: ('breakfast' | 'lunch' | 'dinner' | 'daily')[];
    } = {},
  ): {
    users: TestUser[];
    products: TestProduct[];
    consumptions: TestConsumption[];
    goals: TestGoals[];
    scenarios: any[];
  } {
    const { users = 1, products = 2, consumptions = 3, goals = 1, scenarios = [] } = options;

    // Create users
    const testUsers = TestDataFactory.createMultipleUsers(users);

    // Create products
    const testProducts = TestDataFactory.createMultipleProducts(products);

    // Create consumptions
    const testConsumptions = TestDataFactory.createMultipleConsumptions(consumptions);

    // Create goals
    const testGoals = TestDataFactory.createMultipleGoals(goals);

    // Create scenarios
    const testScenarios = scenarios
      .map((scenario) => {
        switch (scenario) {
          case 'breakfast':
            return TestDataFactory.createBreakfastScenario();
          case 'lunch':
            return TestDataFactory.createLunchScenario();
          case 'dinner':
            return TestDataFactory.createDinnerScenario();
          case 'daily':
            return TestDataFactory.createDailyMealPlan();
          default:
            return null;
        }
      })
      .filter(Boolean);

    // Store lifecycle information
    const lifecycle: TestDataLifecycle = {
      productIds: [],
      consumptionIds: [],
      goalIds: [],
      createdAt: new Date(),
      testName,
    };

    this.lifecycles.set(testName, lifecycle);

    // Cache the data for potential reuse
    this.testDataCache.set(testName, {
      users: testUsers,
      products: testProducts,
      consumptions: testConsumptions,
      goals: testGoals,
      scenarios: testScenarios,
    });

    return {
      users: testUsers,
      products: testProducts,
      consumptions: testConsumptions,
      goals: testGoals,
      scenarios: testScenarios,
    };
  }

  /**
   * Get cached test data for a test
   */
  public getCachedTestData(testName: string): any {
    return this.testDataCache.get(testName);
  }

  /**
   * Create realistic test scenarios
   */
  public createRealisticScenarios(testName: string): {
    weightLossUser: TestUser;
    weightGainUser: TestUser;
    maintenanceUser: TestUser;
    breakfastScenario: { product: TestProduct; consumption: TestConsumption };
    lunchScenario: { product: TestProduct; consumption: TestConsumption };
    dinnerScenario: { product: TestProduct; consumption: TestConsumption };
    weightLossGoals: TestGoals;
    weightGainGoals: TestGoals;
    maintenanceGoals: TestGoals;
  } {
    const weightLossUser = TestDataFactory.createUser({ name: 'Weight Loss User' });
    const weightGainUser = TestDataFactory.createUser({ name: 'Weight Gain User' });
    const maintenanceUser = TestDataFactory.createUser({ name: 'Maintenance User' });

    const breakfastScenario = TestDataFactory.createBreakfastScenario();
    const lunchScenario = TestDataFactory.createLunchScenario();
    const dinnerScenario = TestDataFactory.createDinnerScenario();

    const weightLossGoals = TestDataFactory.createWeightLossGoals();
    const weightGainGoals = TestDataFactory.createWeightGainGoals();
    const maintenanceGoals = TestDataFactory.createMaintenanceGoals();

    // Cache the scenarios
    this.testDataCache.set(`${testName}_scenarios`, {
      weightLossUser,
      weightGainUser,
      maintenanceUser,
      breakfastScenario,
      lunchScenario,
      dinnerScenario,
      weightLossGoals,
      weightGainGoals,
      maintenanceGoals,
    });

    return {
      weightLossUser,
      weightGainUser,
      maintenanceUser,
      breakfastScenario,
      lunchScenario,
      dinnerScenario,
      weightLossGoals,
      weightGainGoals,
      maintenanceGoals,
    };
  }

  /**
   * Create edge case test data
   */
  public createEdgeCaseData(testName: string): {
    zeroCalorieProduct: TestProduct;
    highCalorieProduct: TestProduct;
    zeroMacroProduct: TestProduct;
    extremeGoals: TestGoals;
    invalidConsumption: TestConsumption;
  } {
    const zeroCalorieProduct = TestDataFactory.createProduct({
      name: 'Zero Calorie Product',
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });

    const highCalorieProduct = TestDataFactory.createProduct({
      name: 'High Calorie Product',
      calories: 9999,
      protein: 500,
      fat: 300,
      carbs: 800,
    });

    const zeroMacroProduct = TestDataFactory.createProduct({
      name: 'Zero Macro Product',
      calories: 100,
      protein: 0,
      fat: 0,
      carbs: 0,
    });

    const extremeGoals = TestDataFactory.createGoals({
      dailyCalories: 5000,
      dailyProtein: 500,
      dailyFat: 200,
      dailyCarbs: 600,
      goalType: 'gain',
    });

    const invalidConsumption = TestDataFactory.createConsumption({
      amount: '0',
      date: '2020-01-01', // Past date
    });

    // Cache edge case data
    this.testDataCache.set(`${testName}_edge_cases`, {
      zeroCalorieProduct,
      highCalorieProduct,
      zeroMacroProduct,
      extremeGoals,
      invalidConsumption,
    });

    return {
      zeroCalorieProduct,
      highCalorieProduct,
      zeroMacroProduct,
      extremeGoals,
      invalidConsumption,
    };
  }

  /**
   * Create performance test data (large datasets)
   */
  public createPerformanceTestData(
    testName: string,
    size: 'small' | 'medium' | 'large' = 'medium',
  ): {
    products: TestProduct[];
    consumptions: TestConsumption[];
    users: TestUser[];
  } {
    const sizes = {
      small: { products: 10, consumptions: 50, users: 2 },
      medium: { products: 50, consumptions: 200, users: 5 },
      large: { products: 100, consumptions: 500, users: 10 },
    };

    const config = sizes[size];

    const products = TestDataFactory.createMultipleProducts(config.products);
    const consumptions = TestDataFactory.createMultipleConsumptions(config.consumptions);
    const users = TestDataFactory.createMultipleUsers(config.users);

    // Cache performance data
    this.testDataCache.set(`${testName}_performance_${size}`, {
      products,
      consumptions,
      users,
    });

    return { products, consumptions, users };
  }

  /**
   * Track created data for cleanup
   */
  public trackCreatedData(testName: string, dataType: keyof TestDataLifecycle, id: number): void {
    const lifecycle = this.lifecycles.get(testName);
    if (lifecycle) {
      switch (dataType) {
        case 'userId':
          lifecycle.userId = id;
          break;
        case 'productIds':
          lifecycle.productIds.push(id);
          break;
        case 'consumptionIds':
          lifecycle.consumptionIds.push(id);
          break;
        case 'goalIds':
          lifecycle.goalIds.push(id);
          break;
      }
    }
  }

  /**
   * Clean up test data for a specific test
   */
  public async cleanupTestData(testName: string, page: Page): Promise<void> {
    const lifecycle = this.lifecycles.get(testName);
    if (!lifecycle) {
      return;
    }

    console.log(`🧹 Cleaning up test data for: ${testName}`);

    try {
      // Clean up consumptions
      for (const consumptionId of lifecycle.consumptionIds) {
        await this.deleteConsumption(page, consumptionId);
      }

      // Clean up products
      for (const productId of lifecycle.productIds) {
        await this.deleteProduct(page, productId);
      }

      // Clean up goals (if needed)
      for (const goalId of lifecycle.goalIds) {
        await this.deleteGoal(page, goalId);
      }

      // Remove from tracking
      this.lifecycles.delete(testName);
      this.testDataCache.delete(testName);

      console.log(`✅ Test data cleanup completed for: ${testName}`);
    } catch (error) {
      console.error(`❌ Error cleaning up test data for ${testName}:`, error);
    }
  }

  /**
   * Clean up all test data
   */
  public async cleanupAllTestData(page: Page): Promise<void> {
    console.log('🧹 Cleaning up all test data...');

    const testNames = Array.from(this.lifecycles.keys());
    for (const testName of testNames) {
      await this.cleanupTestData(testName, page);
    }

    // Clear all caches
    this.lifecycles.clear();
    this.testDataCache.clear();

    console.log('✅ All test data cleanup completed');
  }

  /**
   * Delete a product from the application
   */
  private async deleteProduct(page: Page, productId: number): Promise<void> {
    // This would typically call an API or navigate to delete the product
    // For now, we'll just log the action
    console.log(`🗑️ Deleting product with ID: ${productId}`);
  }

  /**
   * Delete a consumption from the application
   */
  private async deleteConsumption(page: Page, consumptionId: number): Promise<void> {
    // This would typically call an API or navigate to delete the consumption
    // For now, we'll just log the action
    console.log(`🗑️ Deleting consumption with ID: ${consumptionId}`);
  }

  /**
   * Delete a goal from the application
   */
  private async deleteGoal(page: Page, goalId: number): Promise<void> {
    // This would typically call an API or navigate to delete the goal
    // For now, we'll just log the action
    console.log(`🗑️ Deleting goal with ID: ${goalId}`);
  }

  /**
   * Get test data statistics
   */
  public getTestDataStats(): {
    totalTests: number;
    totalProducts: number;
    totalConsumptions: number;
    totalGoals: number;
    cacheSize: number;
  } {
    let totalProducts = 0;
    let totalConsumptions = 0;
    let totalGoals = 0;

    for (const lifecycle of this.lifecycles.values()) {
      totalProducts += lifecycle.productIds.length;
      totalConsumptions += lifecycle.consumptionIds.length;
      totalGoals += lifecycle.goalIds.length;
    }

    return {
      totalTests: this.lifecycles.size,
      totalProducts,
      totalConsumptions,
      totalGoals,
      cacheSize: this.testDataCache.size,
    };
  }

  /**
   * Reset the test data manager
   */
  public reset(): void {
    this.lifecycles.clear();
    this.testDataCache.clear();
    TestDataFactory.reset();
    console.log('🔄 Test data manager reset');
  }
}

// Export singleton instance
export const testDataManager = TestDataManager.getInstance();

// Export convenience functions
export const createTestData = (testName: string, options?: any) =>
  testDataManager.createTestData(testName, options);

export const createRealisticScenarios = (testName: string) =>
  testDataManager.createRealisticScenarios(testName);

export const createEdgeCaseData = (testName: string) =>
  testDataManager.createEdgeCaseData(testName);

export const createPerformanceTestData = (testName: string, size?: 'small' | 'medium' | 'large') =>
  testDataManager.createPerformanceTestData(testName, size);

export const cleanupTestData = (testName: string, page: Page) =>
  testDataManager.cleanupTestData(testName, page);

export const cleanupAllTestData = (page: Page) => testDataManager.cleanupAllTestData(page);

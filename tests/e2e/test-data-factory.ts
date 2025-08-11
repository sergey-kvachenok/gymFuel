// TypeScript interfaces for test data
export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export interface TestProduct {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId?: number;
}

export interface TestConsumption {
  productId?: number;
  productName?: string;
  amount: string;
  userId?: number;
  date?: string;
}

export interface TestGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyFat: number;
  dailyCarbs: number;
  goalType: 'maintain' | 'lose' | 'gain';
  userId?: number;
}

// Factory functions for generating unique test data
export class TestDataFactory {
  private static counter = 0;

  private static getUniqueId(): string {
    this.counter++;
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${this.counter}_${randomId}`;
  }

  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const uniqueId = this.getUniqueId();
    return {
      email: `test.user.${uniqueId}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${uniqueId}`,
      ...overrides,
    };
  }

  static createProduct(overrides: Partial<TestProduct> = {}): TestProduct {
    const uniqueId = this.getUniqueId();
    return {
      name: `Test Product ${uniqueId}`,
      calories: 100 + Math.floor(Math.random() * 200),
      protein: 10 + Math.floor(Math.random() * 20),
      fat: 5 + Math.floor(Math.random() * 15),
      carbs: 20 + Math.floor(Math.random() * 30),
      ...overrides,
    };
  }

  static createConsumption(overrides: Partial<TestConsumption> = {}): TestConsumption {
    return {
      amount: (100 + Math.floor(Math.random() * 200)).toString(),
      date: new Date().toISOString().split('T')[0], // Today's date
      ...overrides,
    };
  }

  static createGoals(overrides: Partial<TestGoals> = {}): TestGoals {
    return {
      dailyCalories: 2000 + Math.floor(Math.random() * 500),
      dailyProtein: 150 + Math.floor(Math.random() * 50),
      dailyFat: 65 + Math.floor(Math.random() * 20),
      dailyCarbs: 250 + Math.floor(Math.random() * 50),
      goalType: 'maintain',
      ...overrides,
    };
  }

  // Create multiple instances of test data
  static createMultipleUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  static createMultipleProducts(
    count: number,
    overrides: Partial<TestProduct> = {},
  ): TestProduct[] {
    return Array.from({ length: count }, () => this.createProduct(overrides));
  }

  static createMultipleConsumptions(
    count: number,
    overrides: Partial<TestConsumption> = {},
  ): TestConsumption[] {
    return Array.from({ length: count }, () => this.createConsumption(overrides));
  }

  static createMultipleGoals(count: number, overrides: Partial<TestGoals> = {}): TestGoals[] {
    return Array.from({ length: count }, () => this.createGoals(overrides));
  }

  // Create realistic test scenarios
  static createBreakfastScenario(): { product: TestProduct; consumption: TestConsumption } {
    const product = this.createProduct({
      name: 'Oatmeal with Berries',
      calories: 150,
      protein: 6,
      fat: 3,
      carbs: 27,
    });

    const consumption = this.createConsumption({
      amount: '200',
      productName: product.name,
    });

    return { product, consumption };
  }

  static createLunchScenario(): { product: TestProduct; consumption: TestConsumption } {
    const product = this.createProduct({
      name: 'Grilled Chicken Salad',
      calories: 350,
      protein: 35,
      fat: 12,
      carbs: 15,
    });

    const consumption = this.createConsumption({
      amount: '250',
      productName: product.name,
    });

    return { product, consumption };
  }

  static createDinnerScenario(): { product: TestProduct; consumption: TestConsumption } {
    const product = this.createProduct({
      name: 'Salmon with Vegetables',
      calories: 450,
      protein: 40,
      fat: 25,
      carbs: 20,
    });

    const consumption = this.createConsumption({
      amount: '300',
      productName: product.name,
    });

    return { product, consumption };
  }

  // Create complete daily meal plan
  static createDailyMealPlan(): {
    breakfast: { product: TestProduct; consumption: TestConsumption };
    lunch: { product: TestProduct; consumption: TestConsumption };
    dinner: { product: TestProduct; consumption: TestConsumption };
  } {
    return {
      breakfast: this.createBreakfastScenario(),
      lunch: this.createLunchScenario(),
      dinner: this.createDinnerScenario(),
    };
  }

  // Create weight loss goals scenario
  static createWeightLossGoals(): TestGoals {
    return this.createGoals({
      dailyCalories: 1800,
      dailyProtein: 150,
      dailyFat: 60,
      dailyCarbs: 200,
      goalType: 'lose',
    });
  }

  // Create weight gain goals scenario
  static createWeightGainGoals(): TestGoals {
    return this.createGoals({
      dailyCalories: 2500,
      dailyProtein: 180,
      dailyFat: 80,
      dailyCarbs: 300,
      goalType: 'gain',
    });
  }

  // Create maintenance goals scenario
  static createMaintenanceGoals(): TestGoals {
    return this.createGoals({
      dailyCalories: 2200,
      dailyProtein: 165,
      dailyFat: 70,
      dailyCarbs: 250,
      goalType: 'maintain',
    });
  }

  // Reset counter for clean test runs
  static reset(): void {
    this.counter = 0;
  }
}

// Export commonly used test data
export const COMMON_TEST_DATA = {
  users: {
    new: TestDataFactory.createUser(),
    admin: TestDataFactory.createUser({ name: 'Admin User' }),
  },
  products: {
    breakfast: TestDataFactory.createProduct({ name: 'Breakfast Cereal', calories: 120 }),
    lunch: TestDataFactory.createProduct({ name: 'Turkey Sandwich', calories: 350 }),
    dinner: TestDataFactory.createProduct({ name: 'Grilled Fish', calories: 280 }),
    snack: TestDataFactory.createProduct({ name: 'Apple', calories: 80 }),
  },
  goals: {
    weightLoss: TestDataFactory.createWeightLossGoals(),
    weightGain: TestDataFactory.createWeightGainGoals(),
    maintenance: TestDataFactory.createMaintenanceGoals(),
  },
};

// Utility functions for test data validation
export function validateTestUser(user: TestUser): boolean {
  return !!(user.email && user.password && user.email.includes('@') && user.password.length >= 8);
}

export function validateTestProduct(product: TestProduct): boolean {
  return !!(
    product.name &&
    product.calories >= 0 &&
    product.protein >= 0 &&
    product.fat >= 0 &&
    product.carbs >= 0
  );
}

export function validateTestConsumption(consumption: TestConsumption): boolean {
  return !!(
    consumption.amount &&
    !isNaN(Number(consumption.amount)) &&
    Number(consumption.amount) > 0
  );
}

export function validateTestGoals(goals: TestGoals): boolean {
  return !!(
    goals.dailyCalories > 0 &&
    goals.dailyProtein >= 0 &&
    goals.dailyFat >= 0 &&
    goals.dailyCarbs >= 0 &&
    ['maintain', 'lose', 'gain'].includes(goals.goalType)
  );
}

# Test Data Management System

## Overview

The test data management system provides a comprehensive, type-safe, and maintainable approach to creating and managing test data for the e2e test suite.

## Architecture

### Core Components

1. **TestDataFactory** (`test-data-factory.ts`)
   - TypeScript interfaces for all data types
   - Factory methods for creating test data
   - Validation functions
   - Realistic test scenarios

2. **TestDataManager** (`test-data-manager.ts`)
   - Lifecycle management
   - Data cleanup
   - Caching
   - Statistics tracking

3. **TestDataUtils** (`test-data-utils.ts`)
   - Standardized utilities
   - Convenience functions
   - Common patterns
   - Validation helpers

## Data Types

### TestUser

```typescript
interface TestUser {
  email: string;
  password: string;
  name?: string;
}
```

### TestProduct

```typescript
interface TestProduct {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId?: number;
}
```

### TestConsumption

```typescript
interface TestConsumption {
  productId?: number;
  productName?: string;
  amount: string;
  userId?: number;
  date?: string;
}
```

### TestGoals

```typescript
interface TestGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyFat: number;
  dailyCarbs: number;
  goalType: 'maintain' | 'lose' | 'gain';
  userId?: number;
}
```

## Usage Patterns

### Basic Usage

```typescript
import { createUniqueTestData, createTestUser, createTestProduct } from './test-data-utils';

// Create unique test data for a test
const testData = createUniqueTestData('my-test-name', {
  includeUsers: true,
  includeProducts: true,
  includeConsumptions: true,
  includeGoals: false,
  scenarios: ['breakfast', 'lunch'],
});

// Create individual test data
const user = createTestUser({ name: 'John Doe' });
const product = createTestProduct({ calories: 500 });
```

### Realistic Scenarios

```typescript
import { createRealisticTestScenarios } from './test-data-utils';

const scenarios = createRealisticTestScenarios('my-test');

// Access different user types
const weightLossUser = scenarios.weightLossUser;
const weightGainUser = scenarios.weightGainUser;
const maintenanceUser = scenarios.maintenanceUser;

// Access meal scenarios
const breakfast = scenarios.breakfastScenario;
const lunch = scenarios.lunchScenario;
const dinner = scenarios.dinnerScenario;

// Access goal types
const weightLossGoals = scenarios.weightLossGoals;
const weightGainGoals = scenarios.weightGainGoals;
const maintenanceGoals = scenarios.maintenanceGoals;
```

### Edge Cases

```typescript
import { createEdgeCaseTestData } from './test-data-utils';

const edgeCases = createEdgeCaseTestData('my-test');

// Access edge case data
const zeroCalorieProduct = edgeCases.zeroCalorieProduct;
const highCalorieProduct = edgeCases.highCalorieProduct;
const extremeGoals = edgeCases.extremeGoals;
```

### Performance Testing

```typescript
import { createPerformanceTestData } from './test-data-utils';

// Create large datasets for performance testing
const performanceData = createPerformanceTestData('my-test', 'large');
// Options: 'small', 'medium', 'large'
```

### Test-Specific Data

```typescript
import {
  createDashboardTestData,
  createGoalsTestData,
  createHistoryTestData,
  createAuthenticationTestData,
  createNavigationTestData,
} from './test-data-utils';

// Create data optimized for specific test types
const dashboardData = createDashboardTestData('dashboard-test');
const goalsData = createGoalsTestData('goals-test');
const historyData = createHistoryTestData('history-test');
const authData = createAuthenticationTestData('auth-test');
const navData = createNavigationTestData('nav-test');
```

## Data Lifecycle Management

### Automatic Cleanup

```typescript
import { cleanupTestData, cleanupAllTestData } from './test-data-utils';

// Clean up data for a specific test
await cleanupTestData('my-test-name', page);

// Clean up all test data
await cleanupAllTestData(page);
```

### Manual Tracking

```typescript
import { testDataManager } from './test-data-manager';

// Track created data for cleanup
testDataManager.trackCreatedData('my-test', 'productIds', 123);
testDataManager.trackCreatedData('my-test', 'consumptionIds', 456);
```

### Statistics

```typescript
import { getTestDataStats, printTestDataStats } from './test-data-utils';

// Get statistics
const stats = getTestDataStats();
console.log(`Total tests: ${stats.totalTests}`);
console.log(`Total products: ${stats.totalProducts}`);

// Print formatted statistics
printTestDataStats();
```

## Validation

### Data Validation

```typescript
import { validateTestData } from './test-data-utils';

const testData = createUniqueTestData('my-test');
const validation = validateTestData(testData);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Factory Validation

```typescript
import { TestDataFactory } from './test-data-factory';

// Validate individual data types
const isValidUser = TestDataFactory.validateTestUser(user);
const isValidProduct = TestDataFactory.validateTestProduct(product);
const isValidConsumption = TestDataFactory.validateTestConsumption(consumption);
const isValidGoals = TestDataFactory.validateTestGoals(goals);
```

## Common Patterns

### Product-Consumption Pair

```typescript
import { createProductConsumptionPair } from './test-data-utils';

const { product, consumption } = createProductConsumptionPair();
// consumption.productName is automatically set to product.name
```

### Complete User Profile

```typescript
import { createCompleteUserProfile } from './test-data-utils';

const profile = createCompleteUserProfile();
// Includes: user, goals, products, consumptions
```

### Meal Scenarios

```typescript
import {
  createBreakfastScenario,
  createLunchScenario,
  createDinnerScenario,
  createDailyMealPlan,
} from './test-data-utils';

const breakfast = createBreakfastScenario();
const lunch = createLunchScenario();
const dinner = createDinnerScenario();
const dailyPlan = createDailyMealPlan();
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// Good
const testData = createUniqueTestData('dashboard-add-product-test');

// Bad
const testData = createUniqueTestData('test1');
```

### 2. Include Only Necessary Data

```typescript
// Good - only include what you need
const testData = createUniqueTestData('goals-test', {
  includeUsers: true,
  includeProducts: false,
  includeConsumptions: false,
  includeGoals: true,
});

// Bad - include everything
const testData = createUniqueTestData('goals-test');
```

### 3. Use Realistic Scenarios

```typescript
// Good - use realistic meal scenarios
const scenarios = createRealisticTestScenarios('meal-test');

// Bad - use random data
const product = createTestProduct({ calories: 999999 });
```

### 4. Clean Up After Tests

```typescript
test('should add product', async ({ page }) => {
  const testData = createUniqueTestData('add-product-test');

  // ... test logic ...

  // Clean up
  await cleanupTestData('add-product-test', page);
});
```

### 5. Validate Test Data

```typescript
test('should create valid product', async ({ page }) => {
  const product = createTestProduct();

  // Validate before using
  const validation = validateTestData({ products: [product] });
  expect(validation.isValid).toBe(true);
});
```

## Migration Guide

### From Old Pattern to New Pattern

#### Old Pattern

```typescript
import { createUniqueTestData } from './test-utils';

const testData = createUniqueTestData();
```

#### New Pattern

```typescript
import { createUniqueTestData } from './test-data-utils';

const testData = createUniqueTestData('my-test-name', {
  includeUsers: true,
  includeProducts: true,
  includeConsumptions: true,
});
```

### From Hardcoded Data to Factory

#### Old Pattern

```typescript
const product = {
  name: 'Test Product',
  calories: 100,
  protein: 10,
  fat: 5,
  carbs: 20,
};
```

#### New Pattern

```typescript
import { createTestProduct } from './test-data-utils';

const product = createTestProduct({
  name: 'Test Product',
  calories: 100,
});
```

## Troubleshooting

### Common Issues

1. **Data Conflicts**
   - Ensure each test uses a unique test name
   - Use `createUniqueTestData()` instead of hardcoded data

2. **Validation Failures**
   - Check data types match interfaces
   - Use validation functions before using data

3. **Cleanup Issues**
   - Always call cleanup functions after tests
   - Use try-finally blocks for cleanup

4. **Performance Issues**
   - Use appropriate data sizes for performance tests
   - Cache data when possible

### Debugging

```typescript
import { printTestDataStats } from './test-data-utils';

// Print statistics to debug data issues
printTestDataStats();
```

## Future Enhancements

1. **Database Integration**
   - Direct database operations for faster setup
   - Transaction-based cleanup

2. **Data Seeding**
   - Pre-populated test databases
   - Shared test data across test runs

3. **Advanced Scenarios**
   - Multi-user scenarios
   - Complex workflow data
   - Time-based scenarios

4. **Performance Optimization**
   - Data caching strategies
   - Parallel data creation
   - Incremental data updates

# Playwright E2E Testing Style Guide

## Context

Comprehensive style guide for Playwright end-to-end testing in Agent OS projects, based on enterprise-grade testing patterns and best practices.

## Core Principles

### 1. **Centralized Selector Management**

- **ALWAYS** use centralized selectors from `tests/e2e/selectors.ts`
- **NEVER** use hardcoded selectors in test files
- Use TypeScript types for selector validation
- Follow kebab-case naming convention for selectors

```typescript
// ✅ GOOD - Use centralized selectors
import { DASHBOARD_SELECTORS, PRODUCT_SELECTORS } from './selectors';

await page.getByTestId(DASHBOARD_SELECTORS.WELCOME).toBeVisible();
await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();

// ❌ BAD - Hardcoded selectors
await page.getByTestId('dashboard-welcome').toBeVisible();
await page.getByTestId('product-submit').click();
```

### 2. **Test Data Management**

- **ALWAYS** use `createUniqueTestData()` for test data creation
- **NEVER** use hardcoded test data
- Include only necessary data types for each test
- Use descriptive test names for data isolation

```typescript
// ✅ GOOD - Proper test data management
const testData = createUniqueTestData('dashboard-add-product-test', {
  includeUsers: true,
  includeProducts: true,
  includeConsumptions: false,
  includeGoals: false,
});

// ❌ BAD - Hardcoded test data
const product = {
  name: 'Test Product',
  calories: 100,
  protein: 10,
  fat: 5,
  carbs: 20,
};
```

### 3. **Page Object Model (POM)**

- **ALWAYS** use Page Object Model for complex interactions
- Create page objects for each major page/component
- Extend BasePage for common functionality
- Keep page objects focused and single-purpose

```typescript
// ✅ GOOD - Page Object Model
import { DashboardPage } from './page-objects';

const dashboardPage = new DashboardPage(page);
await dashboardPage.addProduct(productData);
await dashboardPage.verifyProductAdded(productName);

// ❌ BAD - Direct page interactions in tests
await page.getByTestId('product-form').click();
await page.getByTestId('product-name').fill(productName);
await page.getByTestId('product-submit').click();
```

## Test Structure and Organization

### Test File Organization

```typescript
// ✅ GOOD - Proper test file structure
import { test, expect } from '@playwright/test';
import { loginWithTestUser } from './test-utils';
import { createUniqueTestData } from './test-data-utils';
import { DASHBOARD_SELECTORS, PRODUCT_SELECTORS } from './selectors';
import { TEST_CONFIG } from './test-config';

test.describe('Dashboard Functionality', () => {
  test('should add product and update daily stats', async ({ page }) => {
    // Arrange
    await loginWithTestUser(page);
    const testData = createUniqueTestData('dashboard-add-product', {
      includeProducts: true,
      includeConsumptions: false,
    });

    // Act
    await page.getByTestId(PRODUCT_SELECTORS.NAME).fill(testData.products[0].name);
    await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();

    // Assert
    await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS)).toContainText('500');
  });
});
```

### Test Naming Conventions

```typescript
// ✅ GOOD - Descriptive test names
test('should display daily nutrition statistics when user has consumed products');
test('should allow user to add new product with valid nutrition data');
test('should show error message when product form validation fails');
test('should update goals progress when consumption is added');

// ❌ BAD - Vague test names
test('should work');
test('test 1');
test('add product');
```

## Selector Strategy

### Data-Testid Selectors

```typescript
// ✅ GOOD - Comprehensive selector structure
export const DASHBOARD_SELECTORS = {
  WELCOME: 'dashboard-welcome',
  DAILY_STATS: 'daily-stats',
  GOALS_PROGRESS: 'goals-progress',
  TODAYS_MEALS: 'todays-meals',
  MEALS_LIST: 'meals-list',
} as const;

export const PRODUCT_SELECTORS = {
  FORM: 'product-form',
  NAME: 'product-name',
  CALORIES: 'product-calories',
  PROTEIN: 'product-protein',
  FAT: 'product-fat',
  CARBS: 'product-carbs',
  SUBMIT: 'product-submit',
  ITEM: 'my-products-item',
} as const;
```

### Selector Usage Patterns

```typescript
// ✅ GOOD - Proper selector usage
await page.getByTestId(DASHBOARD_SELECTORS.WELCOME).toBeVisible();
await page.getByTestId(PRODUCT_SELECTORS.NAME).fill(productName);
await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();

// For dynamic content, use text-based selection
await page.getByText(productName).click();

// For role-based selection
await page.getByRole('button', { name: 'Add Product' }).click();
```

## Configuration Management

### Centralized Configuration

```typescript
// ✅ GOOD - Centralized configuration
export const TEST_CONFIG = {
  TIMEOUTS: {
    ACTION: 30000,
    NAVIGATION: 30000,
    ASSERTION: 10000,
  },
  WAIT_TIMES: {
    NETWORK_IDLE: 2000,
    ANIMATION: 500,
  },
  URLS: {
    BASE: process.env.TEST_BASE_URL || 'http://localhost:3010',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
  },
} as const;
```

### Environment-Specific Configuration

```typescript
// ✅ GOOD - Environment-aware configuration
export function getTestConfig() {
  const env = process.env.NODE_ENV || 'development';

  return {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3010',
    timeout: env === 'production' ? 60000 : 30000,
    retries: env === 'production' ? 2 : 0,
  };
}
```

## Error Handling and Resilience

### Timeout Protection

- **ALWAYS** implement timeout protection mechanisms
- **NEVER** allow tests to run indefinitely
- **ALWAYS** use agent-timeout-protector.js for stuck test prevention
- **NEVER** rely solely on Playwright's default timeouts

```typescript
// ✅ GOOD - Timeout protection with agent protector
import { runProtectedTest } from './agent-timeout-protector';

test('should complete within timeout limits', async ({ page }) => {
  await runProtectedTest('tests/e2e/feature-test.spec.ts', 'should handle complex workflow', {
    maxTestTime: 60000,
    maxNoProgressTime: 30000,
  });
});

// ✅ GOOD - Test-level timeout protection
test('should handle timeout scenarios', async ({ page }) => {
  const timeoutManager = new TestTimeoutManager({
    maxTestTime: 60000,
    maxNoProgressTime: 30000,
    forceExit: true,
  });

  try {
    await timeoutManager.startTest('timeout-protected-test');

    // Test logic here
    await page.getByTestId(DASHBOARD_SELECTORS.WELCOME).toBeVisible();
  } catch (error) {
    await timeoutManager.forceStopTest('Test exceeded timeout limits');
    throw error;
  } finally {
    await timeoutManager.cleanup();
  }
});

// ✅ GOOD - Process-level timeout protection
test('should use process-level timeout', async ({ page }) => {
  // Run test with process-level timeout protection
  const result = await runTestWithTimeout(
    'npx playwright test tests/e2e/feature.spec.ts',
    60000, // 1 minute timeout
  );

  expect(result.success).toBe(true);
});
```

### Timeout Configuration

```typescript
// ✅ GOOD - Comprehensive timeout configuration
export const TIMEOUT_CONFIG = {
  TEST: {
    MAX_TIME: 60000, // 1 minute per test
    NO_PROGRESS_TIME: 30000, // 30 seconds no progress
    FORCE_EXIT: true,
    KILL_PROCESSES: true,
  },
  PLAYWRIGHT: {
    ACTION: 30000,
    NAVIGATION: 30000,
    ASSERTION: 10000,
    NETWORK_IDLE: 10000,
  },
  AGENT: {
    STUCK_THRESHOLD: 30000, // 30 seconds before considering stuck
    CLEANUP_TIMEOUT: 10000, // 10 seconds for cleanup
    RECOVERY_TIMEOUT: 5000, // 5 seconds for recovery
  },
} as const;

// ✅ GOOD - Environment-specific timeout configuration
export function getTimeoutConfig() {
  const env = process.env.NODE_ENV || 'development';

  return {
    testTimeout: env === 'production' ? 120000 : 60000,
    noProgressTimeout: env === 'production' ? 60000 : 30000,
    forceExit: env === 'production' ? true : false,
  };
}
```

### Agent Timeout Protection Integration

```typescript
// ✅ GOOD - Agent timeout protection in test setup
import { AgentTimeoutProtector } from './agent-timeout-protector';

test.beforeEach(async ({ page }) => {
  const protector = new AgentTimeoutProtector({
    maxTestTime: 60000,
    maxNoProgressTime: 30000,
    forceExit: true,
    killAllPlaywright: true,
  });

  protector.startProtection(`test-${Date.now()}`);

  // Register page for monitoring
  protector.registerProcess(page.context().browser()?.process());
});

test.afterEach(async ({ page }) => {
  // Cleanup timeout protection
  await protector.cleanup();
});

// ✅ GOOD - Progress tracking in tests
test('should track progress and prevent stuck states', async ({ page }) => {
  const protector = new AgentTimeoutProtector();

  try {
    // Update progress at key points
    protector.updateProgress();
    await page.getByTestId(DASHBOARD_SELECTORS.WELCOME).toBeVisible();

    protector.updateProgress();
    await page.getByTestId(PRODUCT_SELECTORS.NAME).fill('Test Product');

    protector.updateProgress();
    await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();
  } finally {
    await protector.cleanup();
  }
});
```

### Retry Mechanisms

```typescript
// ✅ GOOD - Robust error handling with timeout protection
test('should handle network issues gracefully', async ({ page }) => {
  const timeoutManager = new TestTimeoutManager();

  try {
    await timeoutManager.startTest('network-resilience-test');

    await expect(async () => {
      await page.getByTestId(DASHBOARD_SELECTORS.WELCOME).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ACTION,
      });
    }).toPass({
      intervals: [1000, 2000, 4000],
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });
  } finally {
    await timeoutManager.cleanup();
  }
});
```

### Screenshot Capture with Timeout Protection

```typescript
// ✅ GOOD - Automatic screenshot capture with timeout protection
test('should capture screenshot on failure with timeout', async ({ page }) => {
  const timeoutManager = new TestTimeoutManager();

  try {
    await timeoutManager.startTest('screenshot-test');

    await page.getByTestId('non-existent-element').toBeVisible();
  } catch (error) {
    await page.screenshot({ path: 'failure-screenshot.png' });
    await timeoutManager.forceStopTest('Test failed with screenshot captured');
    throw error;
  } finally {
    await timeoutManager.cleanup();
  }
});
```

## Performance Optimization

### Parallel Execution

```typescript
// ✅ GOOD - Test isolation for parallel execution
test.describe.configure({ mode: 'parallel' });

test('should be isolated from other tests', async ({ page }) => {
  const uniqueData = createUniqueTestData('isolated-test');
  // Test logic here
});
```

### Resource Optimization

```typescript
// ✅ GOOD - Resource optimization
test.beforeEach(async ({ page }) => {
  // Disable images and CSS for faster loading
  await page.route('**/*.{png,jpg,jpeg,gif,svg,css}', (route) => route.abort());
});

test.afterEach(async ({ page }) => {
  // Clean up resources
  await page.close();
});
```

## Accessibility Testing

### Keyboard Navigation

```typescript
// ✅ GOOD - Accessibility testing
test('should support keyboard navigation', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'first-focusable');

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'second-focusable');
});
```

### Screen Reader Compatibility

```typescript
// ✅ GOOD - Screen reader testing
test('should have proper ARIA labels', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Product' })).toBeVisible();
  await expect(page.getByLabel('Product name')).toBeVisible();
});
```

## Mobile Testing

### Responsive Design

```typescript
// ✅ GOOD - Mobile testing
test('should work on mobile devices', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await expect(page.getByTestId(DASHBOARD_SELECTORS.WELCOME)).toBeVisible();
  await expect(page.getByTestId('mobile-menu-button')).toBeVisible();
});
```

### Touch Interactions

```typescript
// ✅ GOOD - Touch interaction testing
test('should support touch interactions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.touchscreen.tap(page.getByTestId('mobile-menu-button'));
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
});
```

## Database Isolation and Test Independence

### Database Isolation

- **ALWAYS** use isolated test database
- **NEVER** write to development, staging, or production databases
- **ALWAYS** use dedicated test environment configuration
- **NEVER** share database connections between test and application environments

```typescript
// ✅ GOOD - Isolated test database configuration
export const TEST_CONFIG = {
  DATABASE: {
    URL: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/test_db',
    NAME: 'test_db',
    PORT: 5433, // Different from dev database (5432)
  },
  ENVIRONMENT: {
    NODE_ENV: 'test',
    DATABASE_URL: process.env.TEST_DATABASE_URL,
  },
} as const;

// ✅ GOOD - Test database setup
test.beforeAll(async () => {
  // Ensure test database is isolated
  await setupTestDatabase();
  await seedTestData();
});

test.afterAll(async () => {
  // Clean up test database
  await cleanupTestDatabase();
});
```

### Test Independence

- **ALWAYS** ensure tests are completely independent
- **NEVER** rely on data created by other tests
- **ALWAYS** create unique test data for each test
- **NEVER** assume test execution order

```typescript
// ✅ GOOD - Completely independent test
test('should create product independently', async ({ page }) => {
  // Each test creates its own unique data
  const testData = createUniqueTestData('independent-product-test', {
    includeUsers: true,
    includeProducts: true,
    includeConsumptions: false,
  });

  await loginWithTestUser(page);

  // Test creates its own product
  await page.getByTestId(PRODUCT_SELECTORS.NAME).fill(testData.products[0].name);
  await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();

  // Verify only this test's product exists
  await expect(page.getByText(testData.products[0].name)).toBeVisible();
});

// ❌ BAD - Test depends on other test data
test('should edit existing product', async ({ page }) => {
  // This test assumes another test created a product
  await page.getByText('Product from another test').click(); // Fragile!
});
```

### Database Cleanup

```typescript
// ✅ GOOD - Proper database cleanup
test.afterEach(async ({ page }) => {
  // Clean up test data after each test
  await cleanupTestData('test-name', page);

  // Ensure database is in clean state
  await resetTestDatabase();
});

// ✅ GOOD - Transaction-based cleanup
test('should use transactions for isolation', async ({ page }) => {
  await page.evaluate(async () => {
    // Start transaction
    await window.testDatabase.beginTransaction();

    try {
      // Test logic here
      await createTestProduct();

      // Commit transaction
      await window.testDatabase.commitTransaction();
    } catch (error) {
      // Rollback on error
      await window.testDatabase.rollbackTransaction();
      throw error;
    }
  });
});
```

### Environment Configuration

```typescript
// ✅ GOOD - Environment-specific database configuration
export function getTestDatabaseConfig() {
  const env = process.env.NODE_ENV || 'test';

  if (env !== 'test') {
    throw new Error('Tests must run in test environment');
  }

  return {
    url: process.env.TEST_DATABASE_URL,
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5433'),
    database: process.env.TEST_DB_NAME || 'test_db',
    username: process.env.TEST_DB_USER || 'test',
    password: process.env.TEST_DB_PASSWORD || 'test',
  };
}

// ✅ GOOD - Database connection validation
test.beforeAll(async () => {
  const config = getTestDatabaseConfig();

  // Verify we're connecting to test database
  if (config.database === 'production' || config.database === 'development') {
    throw new Error('Tests cannot run against production or development databases');
  }
});
```

## Test Data Lifecycle

### Setup and Teardown

```typescript
// ✅ GOOD - Proper test lifecycle with database isolation
test.beforeEach(async ({ page }) => {
  // Ensure clean test database state
  await resetTestDatabase();
  await loginWithTestUser(page);
});

test.afterEach(async ({ page }) => {
  // Clean up test data and reset database
  await cleanupTestData('test-name', page);
  await resetTestDatabase();
});

test('should create and clean up test data', async ({ page }) => {
  const testData = createUniqueTestData('lifecycle-test');
  // Test logic here
  // Cleanup happens automatically in afterEach
});
```

### Data Validation

```typescript
// ✅ GOOD - Data validation with database isolation
test('should validate test data before use', async ({ page }) => {
  const testData = createUniqueTestData('validation-test');

  const validation = validateTestData(testData);
  expect(validation.isValid).toBe(true);

  // Use validated data
  await page.getByTestId(PRODUCT_SELECTORS.NAME).fill(testData.products[0].name);
});
```

## Best Practices

### 1. **Test Independence and Database Isolation**

- Each test should be completely independent
- No shared state between tests
- Use unique test data for each test
- **ALWAYS** use isolated test database
- **NEVER** write to development, staging, or production databases
- **ALWAYS** reset database state between tests
- **NEVER** rely on data created by other tests

### 2. **Timeout Protection and Agent Safety**

- **ALWAYS** implement timeout protection mechanisms
- **NEVER** allow tests to run indefinitely
- **ALWAYS** use agent-timeout-protector.js for stuck test prevention
- **NEVER** rely solely on Playwright's default timeouts
- **ALWAYS** track progress at key test points
- **NEVER** create infinite loops or stuck states
- **ALWAYS** implement force termination capabilities
- **NEVER** leave processes hanging after test completion

### 2. **Descriptive Assertions**

- Use descriptive assertion messages
- Test one thing per assertion
- Use appropriate matchers

```typescript
// ✅ GOOD - Descriptive assertions
await expect(page.getByTestId(DASHBOARD_SELECTORS.DAILY_STATS)).toContainText('500', {
  timeout: TEST_CONFIG.TIMEOUTS.ASSERTION,
});

// ❌ BAD - Vague assertions
await expect(page.locator('.stats')).toContainText('500');
```

### 3. **Wait Strategies**

- Use appropriate wait strategies
- Avoid arbitrary timeouts
- Wait for network idle when needed

```typescript
// ✅ GOOD - Proper wait strategies
await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.WAIT_TIMES.NETWORK_IDLE });
await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();

// ❌ BAD - Arbitrary timeouts
await page.waitForTimeout(2000);
```

### 4. **Error Context**

- Provide meaningful error context
- Use descriptive test names
- Add comments for complex logic

```typescript
// ✅ GOOD - Error context
test('should display error when product name is empty', async ({ page }) => {
  // Attempt to submit form without product name
  await page.getByTestId(PRODUCT_SELECTORS.SUBMIT).click();

  // Verify error message is displayed
  await expect(page.getByTestId('product-form-error')).toContainText('Product name is required');
});
```

## Common Anti-Patterns

### ❌ **Avoid These Patterns**

1. **Hardcoded Selectors**

   ```typescript
   // ❌ BAD
   await page.locator('.btn-primary').click();
   ```

2. **Hardcoded Test Data**

   ```typescript
   // ❌ BAD
   const user = { email: 'test@example.com', password: 'password123' };
   ```

3. **Long Test Files**

   ```typescript
   // ❌ BAD - 500+ line test files
   // Use Page Object Model instead
   ```

4. **No Error Handling**

   ```typescript
   // ❌ BAD
   await page.getByTestId('element').click(); // No timeout or error handling
   ```

5. **Fragile Selectors**

   ```typescript
   // ❌ BAD
   await page.locator('div:nth-child(3) > span').click();
   ```

6. **Database Pollution**

   ```typescript
   // ❌ BAD - Writing to development database
   process.env.DATABASE_URL = 'postgresql://dev:dev@localhost:5432/dev_db';

   // ❌ BAD - No database cleanup
   test('should create product', async ({ page }) => {
     // Creates data but never cleans up
   });
   ```

7. **Test Dependencies**

   ```typescript
   // ❌ BAD - Test depends on other test data
   test('should edit product', async ({ page }) => {
     // Assumes another test created a product
     await page.getByText('Product from test 1').click();
   });

   // ❌ BAD - Shared state between tests
   let sharedProductId; // Global variable shared between tests
   ```

8. **Environment Mixing**

   ```typescript
   // ❌ BAD - Using production environment for tests
   NODE_ENV=production npm run test:e2e

   // ❌ BAD - No environment validation
   test('should work', async ({ page }) => {
     // No check if we're in test environment
   });
   ```

9. **No Timeout Protection**

   ```typescript
   // ❌ BAD - No timeout protection
   test('should work without timeout', async ({ page }) => {
     // Test can run indefinitely
     await page.getByTestId('slow-loading-element').toBeVisible();
   });

   // ❌ BAD - Relying only on Playwright defaults
   test('should use default timeouts', async ({ page }) => {
     // No custom timeout protection
     await page.getByTestId('element').click();
   });

   // ❌ BAD - No progress tracking
   test('should not track progress', async ({ page }) => {
     // No way to detect stuck states
     await page.waitForLoadState('networkidle');
   });
   ```

10. **Infinite Loops and Stuck States**

    ```typescript
    // ❌ BAD - Potential infinite loop
    test('should wait for element forever', async ({ page }) => {
      while (!(await page.getByTestId('element').isVisible())) {
        await page.waitForTimeout(1000); // Infinite loop potential
      }
    });

    // ❌ BAD - No stuck state detection
    test('should not detect stuck states', async ({ page }) => {
      // No mechanism to detect if test is stuck
      await page.getByTestId('never-appearing-element').toBeVisible();
    });
    ```

## Performance Guidelines

### Execution Time Targets

- **Individual tests**: < 10 seconds
- **Test suite**: < 1 minute
- **CI/CD pipeline**: < 5 minutes
- **Timeout limits**: 60 seconds per test maximum
- **No-progress threshold**: 30 seconds before stuck detection

### Resource Usage

- **Memory**: < 512MB per test
- **CPU**: Optimize for parallel execution
- **Network**: Minimize external dependencies
- **Process cleanup**: Automatic cleanup within 10 seconds
- **Agent recovery**: < 5 seconds for agent state recovery

## Documentation Requirements

### Test Documentation

- Document complex test scenarios
- Explain business logic being tested
- Document test data requirements
- Update documentation when tests change

### Code Comments

- Comment complex test logic
- Explain why certain approaches are used
- Document workarounds for known issues
- Keep comments up-to-date with code changes

## Quality Metrics

### Success Criteria

- **Test pass rate**: 100%
- **Flaky tests**: 0
- **Code coverage**: 80%+
- **Execution time**: < 1 minute for full suite
- **Timeout compliance**: 100% of tests use timeout protection
- **Stuck test incidents**: 0 per test run
- **Agent recovery rate**: 100% successful recovery from stuck states

### Monitoring

- Track test execution times
- Monitor flaky test frequency
- Report on test coverage trends
- Alert on test failures
- Monitor timeout protection effectiveness
- Track stuck test incidents and recovery
- Report on agent timeout protection usage

## Integration with CI/CD

### Pipeline Configuration

```yaml
# ✅ GOOD - CI/CD configuration
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    TEST_BASE_URL: ${{ secrets.TEST_BASE_URL }}
    NODE_ENV: test
```

### Failure Handling

- Capture screenshots on failure
- Generate detailed test reports
- Retry flaky tests automatically
- Notify team on test failures

This style guide ensures consistent, maintainable, and reliable Playwright e2e tests that scale with the application's growth.

# E2E Test Suite

## 🚀 Quick Start

### Running Tests

```bash
# Run all e2e tests (recommended for CI/CD)
npm run test:e2e

# Run quick verification test only (for fast feedback)
npm run test:e2e:quick

# Run tests with UI for debugging
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug
```

### Test Scripts Explained

| Script           | Purpose                 | Use Case                                 |
| ---------------- | ----------------------- | ---------------------------------------- |
| `test:e2e`       | Run all 46 e2e tests    | **Default choice** - CI/CD, full testing |
| `test:e2e:quick` | Run 1 verification test | Fast feedback during development         |
| `test:e2e:ui`    | Run with Playwright UI  | Interactive debugging                    |
| `test:e2e:debug` | Run in debug mode       | Step-by-step debugging                   |

### When to Use Each Script

- **`npm run test:e2e`** - Use this for:
  - CI/CD pipelines
  - Pre-commit hooks
  - Full regression testing
  - Before deploying to production

- **`npm run test:e2e:quick`** - Use this for:
  - Quick verification during development
  - Fast feedback loops
  - When you only need basic functionality check

- **`npm run test:e2e:ui`** - Use this for:
  - Debugging test failures
  - Understanding test flow
  - Visual inspection of test execution

- **`npm run test:e2e:debug`** - Use this for:
  - Step-by-step debugging
  - Investigating complex test issues
  - When you need to pause and inspect state

## 📊 Test Coverage

The e2e test suite covers:

- **Authentication** (6 tests) - Login, registration, session management
- **Dashboard** (7 tests) - Main dashboard functionality
- **Goals** (8 tests) - Nutrition goals management
- **History** (9 tests) - Consumption history and filtering
- **Navigation** (8 tests) - App navigation and routing
- **User ID Flow** (3 tests) - User-specific data isolation
- **Verification** (5 tests) - System integrity checks

**Total: 46 tests** with 100% pass rate and zero flaky tests.

## 🏗️ Architecture

### Centralized Selector Management

All test selectors are centralized in `tests/e2e/selectors.ts`:

```typescript
import { DASHBOARD_SELECTORS, PRODUCT_SELECTORS } from './selectors';

// Use centralized selectors instead of hardcoded strings
await page.getByTestId(DASHBOARD_SELECTORS.WELCOME).toBeVisible();
```

### Test Data Management

Comprehensive test data management with:

- **TestDataFactory** - Creates unique test data
- **TestDataManager** - Manages test data lifecycle
- **TestDataUtils** - Standardized utilities for test data

### Page Object Model

Tests use Page Object Model for better maintainability:

```typescript
import { DashboardPage } from './page-objects';

const dashboardPage = new DashboardPage(page);
await dashboardPage.addProduct(productData);
```

## 🔧 Configuration

### Environment Setup

Tests run against a dedicated test environment:

- **Database**: Isolated test database
- **Port**: 3010 (separate from dev server)
- **Environment**: `test.env` configuration

### Timeouts and Retries

- **Default timeout**: 30 seconds per action
- **Navigation timeout**: 30 seconds
- **Retries**: 2 retries on CI, 0 on local

## 📈 Performance

- **Execution time**: ~50 seconds for full suite
- **Parallel execution**: 5 workers
- **Memory usage**: Optimized for CI/CD environments

## 🐛 Debugging

### Common Issues

1. **Test database not initialized**

   ```bash
   npm run test:setup
   ```

2. **Port conflicts**
   - Ensure port 3010 is available
   - Kill any existing test servers

3. **Selector not found**
   - Check `tests/e2e/selectors.ts` for correct selector
   - Verify component has proper `data-testid` attribute

### Debug Commands

```bash
# Run specific test file
npx playwright test tests/e2e/dashboard.spec.ts

# Run with verbose output
npx playwright test --reporter=verbose

# Run with trace
npx playwright test --trace=on
```

## 📝 Best Practices

1. **Always use centralized selectors** from `selectors.ts`
2. **Create unique test data** for each test
3. **Clean up test data** after tests
4. **Use descriptive test names** that explain the scenario
5. **Keep tests independent** - no shared state between tests

## 🎯 Success Metrics

- ✅ **100% pass rate** (46/46 tests)
- ✅ **Zero flaky tests**
- ✅ **Fast execution** (<1 minute)
- ✅ **Comprehensive coverage** of all user flows
- ✅ **Maintainable code** with centralized selectors

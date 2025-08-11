# Playwright E2E Tests

This directory contains end-to-end tests for the Vibe nutrition tracker app.

## Test Files

The main test files are located in the `e2e/` directory:

- `e2e/task1-verification.spec.ts` - Verification tests for hardcoded user ID fixes
- `e2e/user-id-flow-test.spec.ts` - User authentication and data isolation tests
- `e2e/hardcoded-user-id-test.spec.ts` - Tests for real user ID usage
- `e2e/simple-user-id-test.spec.ts` - Basic user ID validation tests

## Running Tests

### Prerequisites

1. Install Playwright: `npm install`
2. Set up test environment: `npm run test:setup`

### All E2E Tests

Run all Playwright tests with proper setup:

```bash
npm run test:e2e:all
```

### Specific Test

Run a specific test file:

```bash
npx playwright test tests/e2e/task1-verification.spec.ts
```

### Interactive Testing

Run tests with UI mode (recommended for debugging):

```bash
npm run test:e2e:ui
```

### Debug Mode

Run tests in debug mode:

```bash
npm run test:e2e:debug
```

## Test Configuration

Tests use a centralized configuration system:

- `e2e/test-config.ts` - Test configuration constants
- `e2e/test-utils.ts` - Shared test utilities
- `test.env` - Test environment variables

## Test Scenarios

### User ID Tests

1. **Hardcoded User ID Verification** - Ensures no hardcoded user IDs in console
2. **User Authentication Flow** - Tests complete login and dashboard access
3. **Data Isolation** - Verifies different users see only their own data
4. **Database Isolation** - Ensures tests don't affect development database

## Test Data

Tests use predefined test users:

- `test@example.com` / `password123` (ID: 1)
- `test2@example.com` / `password123` (ID: 2)
- `admin@test.com` / `password123` (ID: 3)

## Debugging

### Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Manual Testing

For manual testing:

1. Set up test environment: `npm run test:setup`
2. Start test server: `npm run dev:test`
3. Open browser and test manually

## Common Issues

### Test Database Issues

If tests fail due to database issues:

```bash
npm run test:setup
```

### Playwright Installation

If Playwright is not installed:

```bash
npx playwright install
```

## Adding New Tests

When adding new tests:

1. Use the centralized configuration from `e2e/test-config.ts`
2. Follow the existing test patterns in `e2e/test-utils.ts`
3. Ensure tests are independent and don't rely on shared state
4. Use proper wait strategies and error handling
5. Run tests before committing: `npm run test:e2e:all`

## Best Practices

1. **Use Constants** - Always use `TEST_CONFIG` constants instead of hardcoded values
2. **Proper Setup** - Always run `test:setup` before running tests
3. **Isolation** - Tests should be independent and not rely on shared state
4. **Error Handling** - Add proper error handling and retry logic
5. **Data Cleanup** - Ensure test data is properly cleaned up between tests

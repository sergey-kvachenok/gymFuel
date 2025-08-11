# Playwright Tests for Offline Functionality

This directory contains end-to-end tests for the offline functionality of the Vibe nutrition tracker app.

## Test Files

- `offline-functionality.spec.ts` - Tests for offline data caching, retrieval, and online/offline transitions

## Running Tests

### Prerequisites

1. Make sure the app is running: `npm run dev`
2. Install Playwright: `npm install`

### Quick Test

Run the offline functionality tests:

```bash
npm run test:offline
```

### All E2E Tests

Run all Playwright tests:

```bash
npm run test:e2e
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

## Test Scenarios

### Offline Functionality Tests

1. **User Registration and Login** - Tests the complete user registration and login flow
2. **Product Creation and Caching** - Tests creating products and verifying they're cached to IndexedDB
3. **Offline Data Retrieval** - Tests that cached data is available when offline
4. **Online/Offline Transitions** - Tests smooth transitions between online and offline modes
5. **Infinite Re-render Prevention** - Tests that the app doesn't cause infinite re-renders during online/offline transitions

## Test Data

Each test creates a unique user with a timestamp-based email to avoid conflicts:

```typescript
const testUser = {
  email: `test-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'password123',
};
```

## Debugging

### Console Logs

The tests include extensive console logging to help debug issues:

- Product caching logs
- Offline data retrieval logs
- Online/offline status changes
- IndexedDB operations

### Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Manual Testing

For manual testing, you can:

1. Start the app: `npm run dev`
2. Open browser dev tools
3. Go to Application tab → IndexedDB to inspect cached data
4. Use Network tab to simulate offline mode

## Common Issues

### App Not Running

If tests fail with "App is not running", make sure:

```bash
npm run dev
```

### Database Issues

If tests fail due to database issues:

```bash
npm run db:migrate:dev
```

### Playwright Installation

If Playwright is not installed:

```bash
npx playwright install
```

## Adding New Tests

When adding new offline functionality:

1. Add test cases to `offline-functionality.spec.ts`
2. Test both online and offline scenarios
3. Include proper cleanup and unique test data
4. Add console logs for debugging
5. Run tests before committing: `npm run test:offline`

## Best Practices

1. **Isolation** - Each test should be independent and not rely on other tests
2. **Cleanup** - Tests should clean up after themselves
3. **Unique Data** - Use timestamp-based unique identifiers
4. **Wait Strategies** - Use proper wait strategies instead of fixed timeouts
5. **Error Handling** - Include proper error handling and assertions

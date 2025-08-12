# Playwright E2E Testing Guide for Junior QA Automation Engineers

## 🎯 **Overview**

This comprehensive guide is designed for junior QA Automation engineers who are new to Playwright and enterprise-level testing. It covers everything from initial setup to implementing production-ready test suites.

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [Writing Your First Test](#writing-your-first-test)
5. [Test Data Management](#test-data-management)
6. [Selector Strategy](#selector-strategy)
7. [Page Object Model](#page-object-model)
8. [Configuration Management](#configuration-management)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Debugging Techniques](#debugging-techniques)
13. [CI/CD Integration](#cicd-integration)
14. [Troubleshooting](#troubleshooting)

---

## 🔧 **Prerequisites**

### Required Knowledge

- Basic JavaScript/TypeScript understanding
- Familiarity with web development concepts
- Understanding of HTML, CSS, and DOM
- Basic command line usage

### Required Software

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended editor)
- **Chrome/Chromium** browser

### Install Node.js

```bash
# Download from https://nodejs.org/
# Or use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

---

## 🚀 **Initial Setup**

### Step 1: Create a New Project

```bash
# Create a new directory for your test project
mkdir my-playwright-project
cd my-playwright-project

# Initialize a new Node.js project
npm init -y

# Install Playwright
npm init playwright@latest

# Follow the setup wizard:
# - Choose TypeScript
# - Choose tests directory: tests/e2e
# - Choose browsers: Chromium, Firefox, Safari
# - Choose GitHub Actions workflow: Yes
# - Install Playwright browsers: Yes
```

### Step 2: Verify Installation

```bash
# Check if Playwright is installed correctly
npx playwright --version

# Run the example test
npx playwright test

# Open Playwright UI
npx playwright test --ui
```

### Step 3: Project Structure Setup

```bash
# Create the recommended directory structure
mkdir -p tests/e2e/{page-objects,utils,data,config}
mkdir -p tests/e2e/{selectors,fixtures,reports}
```

---

## 📁 **Project Structure**

```
my-playwright-project/
├── tests/
│   └── e2e/
│       ├── page-objects/          # Page Object Model classes
│       ├── utils/                 # Utility functions
│       ├── data/                  # Test data files
│       ├── config/                # Configuration files
│       ├── selectors/             # Centralized selectors
│       ├── fixtures/              # Test fixtures
│       ├── reports/               # Test reports
│       └── specs/                 # Test specifications
├── playwright.config.ts           # Playwright configuration
├── package.json                   # Project dependencies
└── README.md                      # Project documentation
```

---

## ✍️ **Writing Your First Test**

### Step 1: Understand the Test Structure

```typescript
// tests/e2e/specs/first-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My First Test Suite', () => {
  test('should navigate to homepage', async ({ page }) => {
    // Arrange - Set up test data and conditions
    const baseUrl = 'https://example.com';

    // Act - Perform the action
    await page.goto(baseUrl);

    // Assert - Verify the result
    await expect(page).toHaveTitle(/Example Domain/);
  });
});
```

### Step 2: Test Anatomy Explained

```typescript
test('descriptive test name', async ({ page }) => {
  // 1. ARRANGE - Prepare test data and conditions
  const testData = {
    username: 'testuser',
    password: 'testpass',
  };

  // 2. ACT - Perform the action being tested
  await page.goto('/login');
  await page.fill('#username', testData.username);
  await page.fill('#password', testData.password);
  await page.click('#login-button');

  // 3. ASSERT - Verify the expected outcome
  await expect(page.locator('.welcome-message')).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
});
```

### Step 3: Running Your First Test

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/specs/first-test.spec.ts

# Run tests in UI mode (recommended for beginners)
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

---

## 🗄️ **Test Data Management**

### Why Test Data Management is Important

**❌ Without proper data management:**

- Tests fail when data changes
- Tests interfere with each other
- Hard to maintain and debug
- No isolation between tests

**✅ With proper data management:**

- Tests are reliable and repeatable
- Each test is independent
- Easy to maintain and debug
- Clear test isolation

### Step 1: Create Test Data Utilities

```typescript
// tests/e2e/utils/test-data.ts
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export interface TestProduct {
  name: string;
  price: number;
  category: string;
}

export class TestDataFactory {
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${timestamp}`,
      ...overrides,
    };
  }

  static createProduct(overrides: Partial<TestProduct> = {}): TestProduct {
    const timestamp = Date.now();
    return {
      name: `Test Product ${timestamp}`,
      price: 99.99,
      category: 'Electronics',
      ...overrides,
    };
  }
}
```

### Step 2: Use Test Data in Tests

```typescript
// tests/e2e/specs/user-registration.spec.ts
import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../utils/test-data';

test.describe('User Registration', () => {
  test('should register new user successfully', async ({ page }) => {
    // Arrange - Create unique test data
    const testUser = TestDataFactory.createUser({
      name: 'John Doe',
    });

    // Act - Perform registration
    await page.goto('/register');
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('#register-button');

    // Assert - Verify registration success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Step 3: Database Isolation

```typescript
// tests/e2e/utils/database.ts
export class TestDatabase {
  static async setup() {
    // Connect to test database (not production!)
    const testDbUrl = process.env.TEST_DATABASE_URL;
    if (!testDbUrl) {
      throw new Error('TEST_DATABASE_URL environment variable is required');
    }

    // Clear test data
    await this.clearTestData();
  }

  static async cleanup() {
    // Clean up test data after each test
    await this.clearTestData();
  }

  private static async clearTestData() {
    // Implementation depends on your database
    // Example for PostgreSQL:
    // await db.query('DELETE FROM users WHERE email LIKE $1', ['testuser%@example.com']);
  }
}
```

---

## 🎯 **Selector Strategy**

### Why Selectors Matter

**❌ Bad selectors (fragile):**

```typescript
// These break when UI changes
await page.locator('div:nth-child(3) > span').click();
await page.locator('.btn-primary').click();
await page.locator('text=Submit').click();
```

**✅ Good selectors (robust):**

```typescript
// These are stable and reliable
await page.getByTestId('submit-button').click();
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email address').fill('test@example.com');
```

### Step 1: Create Centralized Selectors

```typescript
// tests/e2e/selectors/auth-selectors.ts
export const AUTH_SELECTORS = {
  LOGIN_FORM: 'login-form',
  EMAIL_INPUT: 'email-input',
  PASSWORD_INPUT: 'password-input',
  LOGIN_BUTTON: 'login-button',
  ERROR_MESSAGE: 'error-message',
  SUCCESS_MESSAGE: 'success-message',
} as const;

export const NAVIGATION_SELECTORS = {
  DASHBOARD_LINK: 'nav-dashboard',
  PROFILE_LINK: 'nav-profile',
  LOGOUT_BUTTON: 'logout-button',
} as const;
```

### Step 2: Use Selectors in Tests

```typescript
// tests/e2e/specs/login.spec.ts
import { test, expect } from '@playwright/test';
import { AUTH_SELECTORS } from '../selectors/auth-selectors';

test.describe('User Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Arrange
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Act
    await page.goto('/login');
    await page.getByTestId(AUTH_SELECTORS.EMAIL_INPUT).fill(testUser.email);
    await page.getByTestId(AUTH_SELECTORS.PASSWORD_INPUT).fill(testUser.password);
    await page.getByTestId(AUTH_SELECTORS.LOGIN_BUTTON).click();

    // Assert
    await expect(page.getByTestId(AUTH_SELECTORS.SUCCESS_MESSAGE)).toBeVisible();
  });
});
```

### Step 3: Add Data-Testid Attributes to Your App

```html
<!-- In your React/Vue/Angular components -->
<form data-testid="login-form">
  <input data-testid="email-input" type="email" placeholder="Email" />
  <input data-testid="password-input" type="password" placeholder="Password" />
  <button data-testid="login-button">Login</button>
</form>
```

---

## 🏗️ **Page Object Model (POM)**

### Why Use Page Object Model?

**❌ Without POM (messy):**

```typescript
test('should add product to cart', async ({ page }) => {
  await page.goto('/products');
  await page.getByTestId('product-search').fill('laptop');
  await page.getByTestId('search-button').click();
  await page.getByTestId('product-item-1').click();
  await page.getByTestId('add-to-cart-button').click();
  await page.getByTestId('view-cart-button').click();
  // ... more page interactions
});
```

**✅ With POM (clean):**

```typescript
test('should add product to cart', async ({ page }) => {
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  await productPage.searchProduct('laptop');
  await productPage.addToCart('laptop');
  await cartPage.verifyProductAdded('laptop');
});
```

### Step 1: Create Base Page Class

```typescript
// tests/e2e/page-objects/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getElement(testId: string): Promise<Locator> {
    return this.page.getByTestId(testId);
  }

  async clickElement(testId: string) {
    await this.getElement(testId).click();
  }

  async fillElement(testId: string, value: string) {
    await this.getElement(testId).fill(value);
  }
}
```

### Step 2: Create Specific Page Classes

```typescript
// tests/e2e/page-objects/LoginPage.ts
import { BasePage } from './BasePage';
import { AUTH_SELECTORS } from '../selectors/auth-selectors';

export class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.fillElement(AUTH_SELECTORS.EMAIL_INPUT, email);
    await this.fillElement(AUTH_SELECTORS.PASSWORD_INPUT, password);
    await this.clickElement(AUTH_SELECTORS.LOGIN_BUTTON);
  }

  async verifyLoginSuccess() {
    await this.page.getByTestId(AUTH_SELECTORS.SUCCESS_MESSAGE).toBeVisible();
  }

  async verifyLoginError() {
    await this.page.getByTestId(AUTH_SELECTORS.ERROR_MESSAGE).toBeVisible();
  }
}

// tests/e2e/page-objects/DashboardPage.ts
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async verifyUserLoggedIn(username: string) {
    await this.page.getByText(`Welcome, ${username}`).toBeVisible();
  }

  async navigateToProfile() {
    await this.clickElement('nav-profile');
  }

  async logout() {
    await this.clickElement('logout-button');
  }
}
```

### Step 3: Use Page Objects in Tests

```typescript
// tests/e2e/specs/login-with-pom.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { TestDataFactory } from '../utils/test-data';

test.describe('Login with Page Object Model', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    // Arrange
    const testUser = TestDataFactory.createUser();
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Act
    await loginPage.navigateTo('/login');
    await loginPage.login(testUser.email, testUser.password);

    // Assert
    await loginPage.verifyLoginSuccess();
    await dashboardPage.verifyUserLoggedIn(testUser.name);
  });
});
```

---

## ⚙️ **Configuration Management**

### Step 1: Create Configuration Files

```typescript
// tests/e2e/config/test-config.ts
export const TEST_CONFIG = {
  TIMEOUTS: {
    ACTION: 30000, // 30 seconds for actions
    NAVIGATION: 30000, // 30 seconds for navigation
    ASSERTION: 10000, // 10 seconds for assertions
  },
  WAIT_TIMES: {
    NETWORK_IDLE: 2000, // 2 seconds for network idle
    ANIMATION: 500, // 500ms for animations
  },
  URLS: {
    BASE: process.env.TEST_BASE_URL || 'http://localhost:3000',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    PRODUCTS: '/products',
  },
  USERS: {
    ADMIN: {
      email: 'admin@example.com',
      password: 'admin123',
    },
    CUSTOMER: {
      email: 'customer@example.com',
      password: 'customer123',
    },
  },
} as const;
```

### Step 2: Environment-Specific Configuration

```typescript
// tests/e2e/config/environment.ts
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      baseURL: 'http://localhost:3000',
      timeout: 30000,
      retries: 0,
    },
    staging: {
      baseURL: 'https://staging.example.com',
      timeout: 60000,
      retries: 2,
    },
    production: {
      baseURL: 'https://example.com',
      timeout: 60000,
      retries: 2,
    },
  };

  return configs[env] || configs.development;
}
```

### Step 3: Use Configuration in Tests

```typescript
// tests/e2e/specs/configured-test.spec.ts
import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../config/test-config';

test.describe('Configured Tests', () => {
  test('should use configuration timeouts', async ({ page }) => {
    await page.goto(TEST_CONFIG.URLS.BASE + TEST_CONFIG.URLS.LOGIN);

    await page.getByTestId('email-input').fill(TEST_CONFIG.USERS.ADMIN.email, {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    await page.getByTestId('password-input').fill(TEST_CONFIG.USERS.ADMIN.password, {
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    await page.getByTestId('login-button').click({
      timeout: TEST_CONFIG.TIMEOUTS.ACTION,
    });

    await expect(page).toHaveURL(TEST_CONFIG.URLS.DASHBOARD, {
      timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION,
    });
  });
});
```

---

## 🛡️ **Error Handling**

### Step 1: Implement Retry Mechanisms

```typescript
// tests/e2e/utils/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts. Last error: ${lastError.message}`);
      }

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError!;
}
```

### Step 2: Use Retry in Tests

```typescript
// tests/e2e/specs/robust-test.spec.ts
import { test, expect } from '@playwright/test';
import { retry } from '../utils/retry';

test.describe('Robust Tests', () => {
  test('should handle flaky elements', async ({ page }) => {
    await page.goto('/dashboard');

    // Retry getting a potentially flaky element
    await retry(
      async () => {
        const element = page.getByTestId('flaky-element');
        await expect(element).toBeVisible();
      },
      3,
      1000,
    );
  });
});
```

### Step 3: Screenshot Capture on Failure

```typescript
// tests/e2e/utils/screenshot.ts
import { Page } from '@playwright/test';
import path from 'path';

export async function captureScreenshot(page: Page, testName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join('tests/e2e/reports/screenshots', `${testName}-${timestamp}.png`);

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  console.log(`Screenshot saved: ${screenshotPath}`);
}

// Use in tests
test('should capture screenshot on failure', async ({ page }) => {
  try {
    await page.goto('/dashboard');
    await page.getByTestId('non-existent-element').click();
  } catch (error) {
    await captureScreenshot(page, 'dashboard-failure');
    throw error;
  }
});
```

---

## 📋 **Best Practices**

### 1. **Test Independence**

```typescript
// ✅ GOOD - Each test is independent
test('should create user', async ({ page }) => {
  const testUser = TestDataFactory.createUser();
  // Test creates its own data
});

test('should delete user', async ({ page }) => {
  const testUser = TestDataFactory.createUser();
  // Test creates its own data to delete
});
```

### 2. **Descriptive Test Names**

```typescript
// ✅ GOOD - Clear and descriptive
test('should display error message when user enters invalid email format');
test('should redirect to dashboard after successful login');
test('should prevent access to admin panel for non-admin users');

// ❌ BAD - Vague and unclear
test('should work');
test('test 1');
test('login test');
```

### 3. **Proper Assertions**

```typescript
// ✅ GOOD - Specific and meaningful assertions
await expect(page.getByTestId('welcome-message')).toContainText('Welcome, John');
await expect(page).toHaveURL('/dashboard');
await expect(page.getByTestId('user-avatar')).toBeVisible();

// ❌ BAD - Generic assertions
await expect(page.locator('body')).toContainText('Welcome');
```

### 4. **Wait Strategies**

```typescript
// ✅ GOOD - Proper wait strategies
await page.waitForLoadState('networkidle');
await page.getByTestId('submit-button').click();

// ❌ BAD - Arbitrary timeouts
await page.waitForTimeout(2000);
```

---

## ❌ **Common Mistakes to Avoid**

### 1. **Hardcoded Selectors**

```typescript
// ❌ BAD - Fragile selectors
await page.locator('.btn-primary').click();
await page.locator('div:nth-child(3) > span').click();

// ✅ GOOD - Stable selectors
await page.getByTestId('submit-button').click();
await page.getByRole('button', { name: 'Submit' }).click();
```

### 2. **No Error Handling**

```typescript
// ❌ BAD - No error handling
await page.getByTestId('element').click();

// ✅ GOOD - With error handling
try {
  await page.getByTestId('element').click();
} catch (error) {
  await captureScreenshot(page, 'click-failure');
  throw error;
}
```

### 3. **Test Dependencies**

```typescript
// ❌ BAD - Tests depend on each other
let sharedUserId;

test('should create user', async ({ page }) => {
  // Creates user and stores ID
  sharedUserId = await createUser();
});

test('should edit user', async ({ page }) => {
  // Depends on previous test
  await editUser(sharedUserId);
});

// ✅ GOOD - Independent tests
test('should create user', async ({ page }) => {
  const userId = await createUser();
  // Test is complete
});

test('should edit user', async ({ page }) => {
  const userId = await createUser(); // Creates its own user
  await editUser(userId);
});
```

### 4. **No Database Isolation**

```typescript
// ❌ BAD - Writing to production database
process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/prod_db';

// ✅ GOOD - Using test database
process.env.TEST_DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db';
```

---

## 🐛 **Debugging Techniques**

### 1. **Playwright UI Mode**

```bash
# Open Playwright UI for interactive debugging
npx playwright test --ui
```

### 2. **Debug Mode**

```bash
# Run tests in debug mode
npx playwright test --debug
```

### 3. **Trace Viewer**

```bash
# Generate traces for debugging
npx playwright test --trace on

# View traces
npx playwright show-trace trace.zip
```

### 4. **Console Logging**

```typescript
test('should debug with logging', async ({ page }) => {
  console.log('Starting test...');

  await page.goto('/dashboard');
  console.log('Navigated to dashboard');

  const elementCount = await page.locator('.product-item').count();
  console.log(`Found ${elementCount} products`);

  // Add breakpoint
  await page.pause();
});
```

### 5. **Screenshot Debugging**

```typescript
test('should debug with screenshots', async ({ page }) => {
  await page.goto('/dashboard');
  await page.screenshot({ path: 'debug-1-dashboard.png' });

  await page.getByTestId('search-input').fill('laptop');
  await page.screenshot({ path: 'debug-2-search-filled.png' });

  await page.getByTestId('search-button').click();
  await page.screenshot({ path: 'debug-3-search-results.png' });
});
```

---

## 🔄 **CI/CD Integration**

### Step 1: GitHub Actions Setup

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5433:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_DATABASE_URL: postgresql://postgres:test@localhost:5433/test_db
          TEST_BASE_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Step 2: Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test tests/e2e/",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",
    "test:e2e:install": "playwright install"
  }
}
```

### Step 3: Environment Variables

```bash
# .env.test
TEST_BASE_URL=http://localhost:3000
TEST_DATABASE_URL=postgresql://test:test@localhost:5433/test_db
NODE_ENV=test
```

---

## 🔧 **Troubleshooting**

### Common Issues and Solutions

#### 1. **Element Not Found**

```typescript
// Problem: Element not found
await page.getByTestId('non-existent').click();

// Solution: Add proper wait and error handling
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 });
await page.getByTestId('element').click();
```

#### 2. **Test Timeouts**

```typescript
// Problem: Tests timeout
await page.getByTestId('slow-element').click();

// Solution: Increase timeout or add proper wait
await page.getByTestId('slow-element').click({ timeout: 30000 });
// or
await page.waitForLoadState('networkidle');
```

#### 3. **Flaky Tests**

```typescript
// Problem: Test fails intermittently
await page.getByTestId('dynamic-content').click();

// Solution: Add retry mechanism
await retry(
  async () => {
    await page.getByTestId('dynamic-content').click();
  },
  3,
  1000,
);
```

#### 4. **Browser Issues**

```bash
# Problem: Browser not found
# Solution: Reinstall browsers
npx playwright install

# Problem: Browser crashes
# Solution: Use different browser
npx playwright test --project=firefox
```

#### 5. **Network Issues**

```typescript
// Problem: Network timeouts
// Solution: Add network resilience
await page.route('**/*', (route) => {
  if (route.request().resourceType() === 'image') {
    route.abort();
  } else {
    route.continue();
  }
});
```

---

## 📚 **Additional Resources**

### Official Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

### Learning Resources

- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Debugging](https://playwright.dev/docs/debug)

### Community

- [Playwright Discord](https://discord.gg/playwright)
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

---

## 🎯 **Next Steps**

1. **Practice**: Write simple tests for your application
2. **Learn**: Explore advanced Playwright features
3. **Improve**: Implement Page Object Model
4. **Optimize**: Add proper error handling and retries
5. **Scale**: Set up CI/CD pipeline
6. **Maintain**: Keep tests updated with application changes

Remember: **Good tests are like good code - they should be readable, maintainable, and reliable!** 🚀

---

_This guide is based on enterprise-level testing practices and real-world experience. Follow these patterns to create robust, maintainable test suites that scale with your application._

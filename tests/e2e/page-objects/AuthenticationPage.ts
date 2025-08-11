import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestUser } from '../test-data-factory';

/**
 * Page object for Authentication functionality
 */
export class AuthenticationPage extends BasePage {
  // Login page locators
  private readonly loginEmailInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginSubmitButton: Locator;
  private readonly loginForm: Locator;

  // Register page locators
  private readonly registerEmailInput: Locator;
  private readonly registerPasswordInput: Locator;
  private readonly registerNameInput: Locator;
  private readonly registerSubmitButton: Locator;
  private readonly registerForm: Locator;

  // Error message locators
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize login locators
    this.loginEmailInput = this.getByTestId('login-email');
    this.loginPasswordInput = this.getByTestId('login-password');
    this.loginSubmitButton = this.getByTestId('login-submit');
    this.loginForm = this.page.locator('form');

    // Initialize register locators
    this.registerEmailInput = this.getByTestId('register-email');
    this.registerPasswordInput = this.getByTestId('register-password');
    this.registerNameInput = this.getByTestId('register-name');
    this.registerSubmitButton = this.getByTestId('register-submit');
    this.registerForm = this.page.locator('form');

    // Initialize error message locator
    this.errorMessage = this.page.locator('[data-testid*="error"], .error, .alert');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigate('/login');
  }

  /**
   * Navigate to register page
   */
  async navigateToRegister(): Promise<void> {
    await this.navigate('/register');
  }

  /**
   * Wait for login page to load
   */
  async waitForLoginPageLoad(): Promise<void> {
    await this.waitForElementVisible(this.loginEmailInput);
    await this.waitForElementVisible(this.loginPasswordInput);
  }

  /**
   * Wait for register page to load
   */
  async waitForRegisterPageLoad(): Promise<void> {
    await this.waitForElementVisible(this.registerEmailInput);
    await this.waitForElementVisible(this.registerPasswordInput);
  }

  /**
   * Check if login page is loaded
   */
  async isLoginPageLoaded(): Promise<boolean> {
    return this.elementExists(this.loginEmailInput);
  }

  /**
   * Check if register page is loaded
   */
  async isRegisterPageLoaded(): Promise<boolean> {
    return this.elementExists(this.registerEmailInput);
  }

  /**
   * Fill login form
   */
  async fillLoginForm(user: TestUser): Promise<void> {
    await this.fillField(this.loginEmailInput, user.email);
    await this.fillField(this.loginPasswordInput, user.password);
  }

  /**
   * Fill register form
   */
  async fillRegisterForm(user: TestUser): Promise<void> {
    if (user.name) {
      await this.fillField(this.registerNameInput, user.name);
    }
    await this.fillField(this.registerEmailInput, user.email);
    await this.fillField(this.registerPasswordInput, user.password);
  }

  /**
   * Submit login form
   */
  async submitLoginForm(): Promise<void> {
    await this.clickElement(this.loginSubmitButton);
  }

  /**
   * Submit register form
   */
  async submitRegisterForm(): Promise<void> {
    await this.clickElement(this.registerSubmitButton);
  }

  /**
   * Login with user credentials
   */
  async login(user: TestUser): Promise<void> {
    await this.fillLoginForm(user);
    await this.submitLoginForm();

    // Wait for redirect to dashboard
    await this.waitForUrlChange('/login');
    await this.waitForPageLoad();
  }

  /**
   * Register new user
   */
  async register(user: TestUser): Promise<void> {
    await this.fillRegisterForm(user);
    await this.submitRegisterForm();

    // Wait for redirect (usually to login page)
    await this.waitForPageLoad();
  }

  /**
   * Clear login form
   */
  async clearLoginForm(): Promise<void> {
    await this.clearField(this.loginEmailInput);
    await this.clearField(this.loginPasswordInput);
  }

  /**
   * Clear register form
   */
  async clearRegisterForm(): Promise<void> {
    if (await this.elementExists(this.registerNameInput)) {
      await this.clearField(this.registerNameInput);
    }
    await this.clearField(this.registerEmailInput);
    await this.clearField(this.registerPasswordInput);
  }

  /**
   * Test invalid login credentials
   */
  async testInvalidLogin(email: string, password: string): Promise<void> {
    await this.clearLoginForm();
    await this.fillField(this.loginEmailInput, email);
    await this.fillField(this.loginPasswordInput, password);
    await this.submitLoginForm();
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return this.elementExists(this.errorMessage);
  }

  /**
   * Get error message text
   */
  async getErrorMessageText(): Promise<string> {
    if (await this.isErrorMessageDisplayed()) {
      return this.errorMessage.textContent() || '';
    }
    return '';
  }

  /**
   * Check if user is redirected to dashboard after login
   */
  async isRedirectedToDashboard(): Promise<boolean> {
    await this.waitForPageLoad();
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('/') && !currentUrl.includes('/login');
  }

  /**
   * Check if user is redirected to login after register
   */
  async isRedirectedToLogin(): Promise<boolean> {
    await this.waitForPageLoad();
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('/login');
  }

  /**
   * Check if user is authenticated (on dashboard)
   */
  async isUserAuthenticated(): Promise<boolean> {
    const dashboardContent = this.page.getByTestId('dashboard-welcome');
    return this.elementExists(dashboardContent);
  }

  /**
   * Test session persistence
   */
  async testSessionPersistence(): Promise<void> {
    // Reload the page
    await this.reload();

    // Check if still authenticated
    await this.waitForPageLoad();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const logoutButton = this.page.getByTestId('nav-logout');
    if (await this.elementExists(logoutButton)) {
      await this.clickElement(logoutButton);
      await this.waitForPageLoad();
    }
  }

  /**
   * Check if user is logged out
   */
  async isUserLoggedOut(): Promise<boolean> {
    const loginForm = this.page.getByTestId('login-email');
    return this.elementExists(loginForm);
  }

  /**
   * Test authenticated user redirect (should redirect away from login)
   */
  async testAuthenticatedUserRedirect(): Promise<void> {
    // Try to access login page while authenticated
    await this.navigateToLogin();
    await this.waitForPageLoad();
  }

  /**
   * Check if authenticated user is redirected away from login
   */
  async isAuthenticatedUserRedirected(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return !currentUrl.includes('/login');
  }

  /**
   * Get form field values
   */
  async getLoginFormValues(): Promise<{
    email: string;
    password: string;
  }> {
    return {
      email: await this.loginEmailInput.inputValue(),
      password: await this.loginPasswordInput.inputValue(),
    };
  }

  /**
   * Get register form field values
   */
  async getRegisterFormValues(): Promise<{
    name: string;
    email: string;
    password: string;
  }> {
    return {
      name: await this.registerNameInput.inputValue(),
      email: await this.registerEmailInput.inputValue(),
      password: await this.registerPasswordInput.inputValue(),
    };
  }

  /**
   * Check if form fields are visible
   */
  async areLoginFormFieldsVisible(): Promise<boolean> {
    const fields = [this.loginEmailInput, this.loginPasswordInput, this.loginSubmitButton];

    for (const field of fields) {
      if (!(await this.elementExists(field))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if register form fields are visible
   */
  async areRegisterFormFieldsVisible(): Promise<boolean> {
    const fields = [this.registerEmailInput, this.registerPasswordInput, this.registerSubmitButton];

    for (const field of fields) {
      if (!(await this.elementExists(field))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Take authentication page screenshot
   */
  async takeAuthenticationScreenshot(): Promise<void> {
    await this.takeScreenshot('authentication');
  }

  /**
   * Get current authentication state
   */
  async getAuthenticationState(): Promise<{
    isAuthenticated: boolean;
    currentUrl: string;
    hasError: boolean;
    errorMessage: string;
  }> {
    return {
      isAuthenticated: await this.isUserAuthenticated(),
      currentUrl: await this.getCurrentUrl(),
      hasError: await this.isErrorMessageDisplayed(),
      errorMessage: await this.getErrorMessageText(),
    };
  }
}

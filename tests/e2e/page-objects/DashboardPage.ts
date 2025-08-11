import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestProduct, TestConsumption } from '../test-data-factory';

/**
 * Page object for the Dashboard page
 */
export class DashboardPage extends BasePage {
  // Locators
  private readonly welcomeMessage: Locator;
  private readonly dailyStats: Locator;
  private readonly goalsProgress: Locator;
  private readonly todaysMeals: Locator;
  private readonly mealsList: Locator;
  private readonly addProductButton: Locator;
  private readonly addConsumptionButton: Locator;

  // Form locators
  private readonly productForm: Locator;
  private readonly productNameInput: Locator;
  private readonly productCaloriesInput: Locator;
  private readonly productProteinInput: Locator;
  private readonly productFatInput: Locator;
  private readonly productCarbsInput: Locator;
  private readonly productSubmitButton: Locator;

  private readonly consumptionForm: Locator;
  private readonly consumptionProductSelect: Locator;
  private readonly consumptionAmountInput: Locator;
  private readonly consumptionSubmitButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.welcomeMessage = this.getByTestId('dashboard-welcome');
    this.dailyStats = this.getByTestId('daily-stats');
    this.goalsProgress = this.getByTestId('goals-progress');
    this.todaysMeals = this.getByTestId('todays-meals');
    this.mealsList = this.getByTestId('meals-list');
    this.addProductButton = this.getByRole('button', 'Add Product');
    this.addConsumptionButton = this.getByRole('button', 'Add Consumption');

    // Product form locators
    this.productForm = this.getByTestId('product-form');
    this.productNameInput = this.getByTestId('product-name');
    this.productCaloriesInput = this.getByTestId('product-calories');
    this.productProteinInput = this.getByTestId('product-protein');
    this.productFatInput = this.getByTestId('product-fat');
    this.productCarbsInput = this.getByTestId('product-carbs');
    this.productSubmitButton = this.getByTestId('product-submit');

    // Consumption form locators
    this.consumptionForm = this.getByTestId('consumption-form');
    this.consumptionProductSelect = this.getByText('Select a product...');
    this.consumptionAmountInput = this.getByTestId('consumption-amount');
    this.consumptionSubmitButton = this.getByTestId('consumption-submit');
  }

  /**
   * Navigate to the dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigate('/');
  }

  /**
   * Wait for dashboard to load
   */
  async waitForDashboardLoad(): Promise<void> {
    await this.waitForElementVisible(this.welcomeMessage);
    await this.waitForElementVisible(this.dailyStats);
  }

  /**
   * Check if dashboard is loaded
   */
  async isDashboardLoaded(): Promise<boolean> {
    return this.elementExists(this.welcomeMessage);
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return this.welcomeMessage.textContent() || '';
  }

  /**
   * Get daily statistics
   */
  async getDailyStats(): Promise<{
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  }> {
    const statsText = (await this.dailyStats.textContent()) || '';

    // Extract numeric values from the stats text
    const numbers = statsText.match(/\d+/g) || [];

    return {
      calories: numbers[0] || '0',
      protein: numbers[1] || '0',
      fat: numbers[2] || '0',
      carbs: numbers[3] || '0',
    };
  }

  /**
   * Check if goals progress is visible
   */
  async isGoalsProgressVisible(): Promise<boolean> {
    return this.elementExists(this.goalsProgress);
  }

  /**
   * Get goals progress text
   */
  async getGoalsProgressText(): Promise<string> {
    return this.goalsProgress.textContent() || '';
  }

  /**
   * Check if today's meals are visible
   */
  async isTodaysMealsVisible(): Promise<boolean> {
    return this.elementExists(this.todaysMeals);
  }

  /**
   * Get meals list text
   */
  async getMealsListText(): Promise<string> {
    return this.mealsList.textContent() || '';
  }

  /**
   * Click add product button
   */
  async clickAddProduct(): Promise<void> {
    await this.clickElement(this.addProductButton);
    await this.waitForElementVisible(this.productForm);
  }

  /**
   * Fill product form
   */
  async fillProductForm(product: TestProduct): Promise<void> {
    await this.fillField(this.productNameInput, product.name);
    await this.fillField(this.productCaloriesInput, product.calories.toString());
    await this.fillField(this.productProteinInput, product.protein.toString());
    await this.fillField(this.productFatInput, product.fat.toString());
    await this.fillField(this.productCarbsInput, product.carbs.toString());
  }

  /**
   * Submit product form
   */
  async submitProductForm(): Promise<void> {
    await this.clickElement(this.productSubmitButton);
    await this.waitForNetworkIdle();
  }

  /**
   * Add a new product
   */
  async addProduct(product: TestProduct): Promise<void> {
    await this.clickAddProduct();
    await this.fillProductForm(product);
    await this.submitProductForm();
  }

  /**
   * Click add consumption button
   */
  async clickAddConsumption(): Promise<void> {
    await this.clickElement(this.addConsumptionButton);
    await this.waitForElementVisible(this.consumptionForm);
  }

  /**
   * Select product for consumption
   */
  async selectProductForConsumption(productName: string): Promise<void> {
    await this.clickElement(this.consumptionProductSelect);
    await this.page.waitForTimeout(1000); // Wait for dropdown to open
    await this.clickElement(this.getByText(productName));
  }

  /**
   * Fill consumption form
   */
  async fillConsumptionForm(consumption: TestConsumption): Promise<void> {
    if (consumption.productName) {
      await this.selectProductForConsumption(consumption.productName);
    }
    await this.fillField(this.consumptionAmountInput, consumption.amount);
  }

  /**
   * Submit consumption form
   */
  async submitConsumptionForm(): Promise<void> {
    await this.clickElement(this.consumptionSubmitButton);
    await this.waitForNetworkIdle();
  }

  /**
   * Add a new consumption
   */
  async addConsumption(consumption: TestConsumption): Promise<void> {
    await this.clickAddConsumption();
    await this.fillConsumptionForm(consumption);
    await this.submitConsumptionForm();
  }

  /**
   * Check if product exists in the list
   */
  async productExists(productName: string): Promise<boolean> {
    const productElement = this.getByText(productName);
    return this.elementExists(productElement);
  }

  /**
   * Check if consumption exists in the list
   */
  async consumptionExists(productName: string): Promise<boolean> {
    const consumptionElement = this.getByText(productName);
    return this.elementExists(consumptionElement);
  }

  /**
   * Delete a product (if delete functionality exists)
   */
  async deleteProduct(productName: string): Promise<void> {
    const productElement = this.getByText(productName);
    const deleteButton = productElement.locator('[data-testid*="delete"]');

    if (await this.elementExists(deleteButton)) {
      await this.clickElement(deleteButton);
      await this.waitForNetworkIdle();
    }
  }

  /**
   * Delete a consumption (if delete functionality exists)
   */
  async deleteConsumption(productName: string): Promise<void> {
    const consumptionElement = this.getByText(productName);
    const deleteButton = consumptionElement.locator('[data-testid*="delete"]');

    if (await this.elementExists(deleteButton)) {
      await this.clickElement(deleteButton);
      await this.waitForNetworkIdle();
    }
  }

  /**
   * Check if empty state is displayed
   */
  async isEmptyStateDisplayed(): Promise<boolean> {
    const emptyStateText = (await this.mealsList.textContent()) || '';
    return emptyStateText.includes('No meals') || emptyStateText.includes('empty');
  }

  /**
   * Get initial calories value
   */
  async getInitialCalories(): Promise<string> {
    const stats = await this.getDailyStats();
    return stats.calories;
  }

  /**
   * Wait for calories to update
   */
  async waitForCaloriesUpdate(initialCalories: string): Promise<void> {
    await this.waitForCondition(async () => {
      const currentStats = await this.getDailyStats();
      return currentStats.calories !== initialCalories;
    });
  }

  /**
   * Take dashboard screenshot
   */
  async takeDashboardScreenshot(): Promise<void> {
    await this.takeScreenshot('dashboard');
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestGoals } from '../test-data-factory';

/**
 * Page object for the Goals page
 */
export class GoalsPage extends BasePage {
  // Locators
  private readonly goalsPage: Locator;
  private readonly goalsForm: Locator;
  private readonly dailyCaloriesInput: Locator;
  private readonly dailyProteinInput: Locator;
  private readonly dailyFatInput: Locator;
  private readonly dailyCarbsInput: Locator;
  private readonly goalTypeSelect: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.goalsPage = this.getByTestId('goals-page');
    this.goalsForm = this.getByTestId('goals-form');
    this.dailyCaloriesInput = this.getByTestId('goals-dailyCalories');
    this.dailyProteinInput = this.getByTestId('goals-dailyProtein');
    this.dailyFatInput = this.getByTestId('goals-dailyFat');
    this.dailyCarbsInput = this.getByTestId('goals-dailyCarbs');
    this.goalTypeSelect = this.getByTestId('goals-goalType');
    this.submitButton = this.getByTestId('goals-submit');
  }

  /**
   * Navigate to the goals page
   */
  async navigateToGoals(): Promise<void> {
    await this.navigate('/goals');
  }

  /**
   * Wait for goals page to load
   */
  async waitForGoalsPageLoad(): Promise<void> {
    await this.waitForElementVisible(this.goalsPage);
    await this.waitForElementVisible(this.goalsForm);
  }

  /**
   * Check if goals page is loaded
   */
  async isGoalsPageLoaded(): Promise<boolean> {
    return this.elementExists(this.goalsPage);
  }

  /**
   * Check if goals form is visible
   */
  async isGoalsFormVisible(): Promise<boolean> {
    return this.elementExists(this.goalsForm);
  }

  /**
   * Get current goals values
   */
  async getCurrentGoals(): Promise<{
    dailyCalories: string;
    dailyProtein: string;
    dailyFat: string;
    dailyCarbs: string;
    goalType: string;
  }> {
    return {
      dailyCalories: await this.dailyCaloriesInput.inputValue(),
      dailyProtein: await this.dailyProteinInput.inputValue(),
      dailyFat: await this.dailyFatInput.inputValue(),
      dailyCarbs: await this.dailyCarbsInput.inputValue(),
      goalType: await this.goalTypeSelect.inputValue(),
    };
  }

  /**
   * Fill goals form
   */
  async fillGoalsForm(goals: TestGoals): Promise<void> {
    await this.fillField(this.dailyCaloriesInput, goals.dailyCalories.toString());
    await this.fillField(this.dailyProteinInput, goals.dailyProtein.toString());
    await this.fillField(this.dailyFatInput, goals.dailyFat.toString());
    await this.fillField(this.dailyCarbsInput, goals.dailyCarbs.toString());
    await this.selectOption(this.goalTypeSelect, goals.goalType);
  }

  /**
   * Submit goals form
   */
  async submitGoalsForm(): Promise<void> {
    await this.clickElement(this.submitButton);
    await this.waitForNetworkIdle();

    // Handle any dialog that might appear
    await this.handleDialog(true);
    await this.page.waitForTimeout(2000); // Wait for save operation
  }

  /**
   * Set new goals
   */
  async setGoals(goals: TestGoals): Promise<void> {
    await this.fillGoalsForm(goals);
    await this.submitGoalsForm();
  }

  /**
   * Set weight loss goals
   */
  async setWeightLossGoals(): Promise<void> {
    const weightLossGoals: TestGoals = {
      dailyCalories: 1800,
      dailyProtein: 150,
      dailyFat: 60,
      dailyCarbs: 200,
      goalType: 'lose',
    };
    await this.setGoals(weightLossGoals);
  }

  /**
   * Set weight gain goals
   */
  async setWeightGainGoals(): Promise<void> {
    const weightGainGoals: TestGoals = {
      dailyCalories: 2500,
      dailyProtein: 180,
      dailyFat: 80,
      dailyCarbs: 300,
      goalType: 'gain',
    };
    await this.setGoals(weightGainGoals);
  }

  /**
   * Set maintenance goals
   */
  async setMaintenanceGoals(): Promise<void> {
    const maintenanceGoals: TestGoals = {
      dailyCalories: 2200,
      dailyProtein: 165,
      dailyFat: 70,
      dailyCarbs: 250,
      goalType: 'maintain',
    };
    await this.setGoals(maintenanceGoals);
  }

  /**
   * Change goal type
   */
  async changeGoalType(goalType: 'maintain' | 'lose' | 'gain'): Promise<void> {
    await this.selectOption(this.goalTypeSelect, goalType);
  }

  /**
   * Test form validation by filling invalid values
   */
  async testFormValidation(): Promise<void> {
    // Fill invalid values
    await this.fillField(this.dailyCaloriesInput, '-100');
    await this.fillField(this.dailyProteinInput, '0');
    await this.fillField(this.dailyFatInput, '');
    await this.fillField(this.dailyCarbsInput, '9999');

    // Try to submit
    await this.clickElement(this.submitButton);
  }

  /**
   * Check if form is still accessible after submission
   */
  async isFormAccessible(): Promise<boolean> {
    return this.elementExists(this.dailyCaloriesInput);
  }

  /**
   * Get form field values
   */
  async getFormFieldValues(): Promise<{
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
    goalType: string;
  }> {
    return {
      calories: await this.dailyCaloriesInput.inputValue(),
      protein: await this.dailyProteinInput.inputValue(),
      fat: await this.dailyFatInput.inputValue(),
      carbs: await this.dailyCarbsInput.inputValue(),
      goalType: await this.goalTypeSelect.inputValue(),
    };
  }

  /**
   * Check if all form fields are visible
   */
  async areAllFormFieldsVisible(): Promise<boolean> {
    const fields = [
      this.dailyCaloriesInput,
      this.dailyProteinInput,
      this.dailyFatInput,
      this.dailyCarbsInput,
      this.goalTypeSelect,
    ];

    for (const field of fields) {
      if (!(await this.elementExists(field))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return !(await this.submitButton.isDisabled());
  }

  /**
   * Take goals page screenshot
   */
  async takeGoalsPageScreenshot(): Promise<void> {
    await this.takeScreenshot('goals-page');
  }

  /**
   * Reset goals to default values
   */
  async resetToDefaultGoals(): Promise<void> {
    const defaultGoals: TestGoals = {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyFat: 65,
      dailyCarbs: 250,
      goalType: 'maintain',
    };
    await this.setGoals(defaultGoals);
  }
}

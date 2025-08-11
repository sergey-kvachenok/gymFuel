import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the History page
 */
export class HistoryPage extends BasePage {
  // Locators
  private readonly historyPage: Locator;
  private readonly historyFilters: Locator;
  private readonly historyList: Locator;
  private readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.historyPage = this.getByTestId('history-page');
    this.historyFilters = this.getByTestId('history-filters');
    this.historyList = this.getByTestId('history-list');
    this.emptyStateMessage = this.getByText('No nutrition data found for the selected period.');
  }

  /**
   * Navigate to the history page
   */
  async navigateToHistory(): Promise<void> {
    await this.navigate('/history');
  }

  /**
   * Wait for history page to load
   */
  async waitForHistoryPageLoad(): Promise<void> {
    await this.waitForElementVisible(this.historyPage);
    await this.waitForElementVisible(this.historyFilters);
  }

  /**
   * Check if history page is loaded
   */
  async isHistoryPageLoaded(): Promise<boolean> {
    return this.elementExists(this.historyPage);
  }

  /**
   * Check if history filters are visible
   */
  async areHistoryFiltersVisible(): Promise<boolean> {
    return this.elementExists(this.historyFilters);
  }

  /**
   * Check if history list is visible (has data)
   */
  async isHistoryListVisible(): Promise<boolean> {
    return this.elementExists(this.historyList);
  }

  /**
   * Check if empty state is visible (no data)
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return this.elementExists(this.emptyStateMessage);
  }

  /**
   * Get history list text content
   */
  async getHistoryListText(): Promise<string> {
    if (await this.isHistoryListVisible()) {
      return this.historyList.textContent() || '';
    }
    return '';
  }

  /**
   * Get empty state message
   */
  async getEmptyStateMessage(): Promise<string> {
    return this.emptyStateMessage.textContent() || '';
  }

  /**
   * Check if specific consumption entry exists
   */
  async consumptionEntryExists(productName: string): Promise<boolean> {
    const entryElement = this.getByText(productName);
    return this.elementExists(entryElement);
  }

  /**
   * Get all consumption entries
   */
  async getAllConsumptionEntries(): Promise<string[]> {
    if (await this.isHistoryListVisible()) {
      const entries = this.historyList.locator('[data-testid*="consumption"]');
      const count = await entries.count();
      const entryTexts: string[] = [];

      for (let i = 0; i < count; i++) {
        const text = await entries.nth(i).textContent();
        if (text) {
          entryTexts.push(text);
        }
      }

      return entryTexts;
    }
    return [];
  }

  /**
   * Click on a consumption entry to view details
   */
  async clickConsumptionEntry(productName: string): Promise<void> {
    const entryElement = this.getByText(productName);
    await this.clickElement(entryElement);
  }

  /**
   * Check if date filter controls exist
   */
  async doDateFiltersExist(): Promise<boolean> {
    const dateFilterElements = this.page.locator('[data-testid*="date-filter"]');
    const count = await dateFilterElements.count();
    return count > 0;
  }

  /**
   * Click on date filter
   */
  async clickDateFilter(): Promise<void> {
    const dateFilterElements = this.page.locator('[data-testid*="date-filter"]');
    if (await this.doDateFiltersExist()) {
      await this.clickElement(dateFilterElements.first());
    }
  }

  /**
   * Check if product filter controls exist
   */
  async doProductFiltersExist(): Promise<boolean> {
    const productFilterElements = this.page.locator('[data-testid*="product-filter"]');
    const count = await productFilterElements.count();
    return count > 0;
  }

  /**
   * Click on product filter
   */
  async clickProductFilter(): Promise<void> {
    const productFilterElements = this.page.locator('[data-testid*="product-filter"]');
    if (await this.doProductFiltersExist()) {
      await this.clickElement(productFilterElements.first());
    }
  }

  /**
   * Check if sorting controls exist
   */
  async doSortingControlsExist(): Promise<boolean> {
    const sortingElements = this.page.locator('[data-testid*="sort"]');
    const count = await sortingElements.count();
    return count > 0;
  }

  /**
   * Click on sorting control
   */
  async clickSortingControl(): Promise<void> {
    const sortingElements = this.page.locator('[data-testid*="sort"]');
    if (await this.doSortingControlsExist()) {
      await this.clickElement(sortingElements.first());
    }
  }

  /**
   * Check if nutrition totals are displayed
   */
  async areNutritionTotalsDisplayed(): Promise<boolean> {
    const totalsElements = this.page.locator('[data-testid*="nutrition-totals"]');
    const count = await totalsElements.count();
    return count > 0;
  }

  /**
   * Get nutrition totals text
   */
  async getNutritionTotalsText(): Promise<string> {
    const totalsElements = this.page.locator('[data-testid*="nutrition-totals"]');
    if (await this.areNutritionTotalsDisplayed()) {
      return totalsElements.first().textContent() || '';
    }
    return '';
  }

  /**
   * Check if detailed consumption view is available
   */
  async isDetailedViewAvailable(): Promise<boolean> {
    const detailElements = this.page.locator('[data-testid*="consumption-detail"]');
    const count = await detailElements.count();
    return count > 0;
  }

  /**
   * Open detailed consumption view
   */
  async openDetailedView(productName: string): Promise<void> {
    const entryElement = this.getByText(productName);
    const detailButton = entryElement.locator('[data-testid*="view-details"]');

    if (await this.elementExists(detailButton)) {
      await this.clickElement(detailButton);
    }
  }

  /**
   * Check if consumption details modal is visible
   */
  async isDetailsModalVisible(): Promise<boolean> {
    const modalElements = this.page.locator('[data-testid*="consumption-modal"]');
    const count = await modalElements.count();
    return count > 0;
  }

  /**
   * Close consumption details modal
   */
  async closeDetailsModal(): Promise<void> {
    const closeButton = this.page.locator('[data-testid*="modal-close"]');
    if (await this.elementExists(closeButton)) {
      await this.clickElement(closeButton);
    }
  }

  /**
   * Wait for history data to load
   */
  async waitForHistoryData(): Promise<void> {
    await this.waitForCondition(async () => {
      return (await this.isHistoryListVisible()) || (await this.isEmptyStateVisible());
    });
  }

  /**
   * Take history page screenshot
   */
  async takeHistoryPageScreenshot(): Promise<void> {
    await this.takeScreenshot('history-page');
  }

  /**
   * Get current page state (has data or empty)
   */
  async getPageState(): Promise<'has-data' | 'empty' | 'loading'> {
    if (await this.isHistoryListVisible()) {
      return 'has-data';
    } else if (await this.isEmptyStateVisible()) {
      return 'empty';
    } else {
      return 'loading';
    }
  }
}

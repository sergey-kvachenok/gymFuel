// Export all page objects
export { BasePage } from './BasePage';
export { DashboardPage } from './DashboardPage';
export { GoalsPage } from './GoalsPage';
export { HistoryPage } from './HistoryPage';
export { NavigationPage } from './NavigationPage';
export { AuthenticationPage } from './AuthenticationPage';

// Export page object types for convenience
export type { TestUser, TestProduct, TestConsumption, TestGoals } from '../test-data-factory';

// Export test data factory
export { TestDataFactory, COMMON_TEST_DATA } from '../test-data-factory';

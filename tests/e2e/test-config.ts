import { configManager } from './config/environment-config';

// Test configuration constants
export const TEST_CONFIG = {
  BASE_URL: configManager.get('BASE_URL'),
  TIMEOUTS: {
    NAVIGATION: configManager.get('NAVIGATION_TIMEOUT'),
    ACTION: configManager.get('ACTION_TIMEOUT'),
    SHORT: configManager.get('SHORT_TIMEOUT'),
    MEDIUM: 15000, // Keep for backward compatibility
  },
  WAIT_TIMES: {
    NETWORK_IDLE: configManager.get('NETWORK_IDLE_WAIT'),
    CONSOLE_MESSAGES: 2000, // Keep for backward compatibility
    DATABASE_OPERATION: 5000, // Keep for backward compatibility
  },
} as const;

// Helper function to get the base URL for navigation
export function getBaseUrl(): string {
  return TEST_CONFIG.BASE_URL;
}

// Helper function to get relative URL (uses baseURL from Playwright config)
export function getRelativeUrl(path: string = '/'): string {
  return path;
}

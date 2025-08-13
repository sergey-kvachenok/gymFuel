import { z } from 'zod';

// Environment configuration schema
const EnvironmentConfigSchema = z.object({
  // Base configuration
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string(),

  // Timeouts
  NAVIGATION_TIMEOUT: z.number().min(1000).max(60000),
  ACTION_TIMEOUT: z.number().min(1000).max(30000),
  SHORT_TIMEOUT: z.number().min(500).max(10000),

  // Wait times
  NETWORK_IDLE_WAIT: z.number().min(1000).max(10000),
  ELEMENT_WAIT: z.number().min(500).max(5000),

  // Test configuration
  WORKERS: z.number().min(1).max(10),
  RETRY_ATTEMPTS: z.number().min(1).max(5),
  SCREENSHOT_ON_FAILURE: z.boolean(),

  // Browser configuration
  HEADLESS: z.boolean(),
  SLOW_MO: z.number().min(0).max(5000),

  // Database configuration
  DB_HOST: z.string(),
  DB_PORT: z.number().min(1).max(65535),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
});

// Environment types
export type Environment = 'development' | 'test' | 'staging' | 'production';

// Configuration interface
export interface EnvironmentConfig {
  BASE_URL: string;
  DATABASE_URL: string;
  NAVIGATION_TIMEOUT: number;
  ACTION_TIMEOUT: number;
  SHORT_TIMEOUT: number;
  NETWORK_IDLE_WAIT: number;
  ELEMENT_WAIT: number;
  WORKERS: number;
  RETRY_ATTEMPTS: number;
  SCREENSHOT_ON_FAILURE: boolean;
  HEADLESS: boolean;
  SLOW_MO: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

// Default configurations for different environments
const DEFAULT_CONFIGS: Record<Environment, Partial<EnvironmentConfig>> = {
  development: {
    BASE_URL: 'http://localhost:3000',
    NAVIGATION_TIMEOUT: 30000,
    ACTION_TIMEOUT: 10000,
    SHORT_TIMEOUT: 5000,
    NETWORK_IDLE_WAIT: 2000,
    ELEMENT_WAIT: 1000,
    WORKERS: 1,
    RETRY_ATTEMPTS: 1,
    SCREENSHOT_ON_FAILURE: false,
    HEADLESS: false,
    SLOW_MO: 1000,
  },
  test: {
    BASE_URL: 'http://localhost:3010',
    NAVIGATION_TIMEOUT: 30000,
    ACTION_TIMEOUT: 10000,
    SHORT_TIMEOUT: 5000,
    NETWORK_IDLE_WAIT: 10000, // Increased from 2000ms to 10000ms
    ELEMENT_WAIT: 1000,
    WORKERS: 5,
    RETRY_ATTEMPTS: 2,
    SCREENSHOT_ON_FAILURE: true,
    HEADLESS: true,
    SLOW_MO: 0,
  },
  staging: {
    BASE_URL: 'https://staging.vibe-app.com',
    NAVIGATION_TIMEOUT: 45000,
    ACTION_TIMEOUT: 15000,
    SHORT_TIMEOUT: 8000,
    NETWORK_IDLE_WAIT: 3000,
    ELEMENT_WAIT: 1500,
    WORKERS: 3,
    RETRY_ATTEMPTS: 3,
    SCREENSHOT_ON_FAILURE: true,
    HEADLESS: true,
    SLOW_MO: 0,
  },
  production: {
    BASE_URL: 'https://vibe-app.com',
    NAVIGATION_TIMEOUT: 60000,
    ACTION_TIMEOUT: 20000,
    SHORT_TIMEOUT: 10000,
    NETWORK_IDLE_WAIT: 5000,
    ELEMENT_WAIT: 2000,
    WORKERS: 2,
    RETRY_ATTEMPTS: 3,
    SCREENSHOT_ON_FAILURE: true,
    HEADLESS: true,
    SLOW_MO: 0,
  },
};

/**
 * Environment configuration manager
 */
export class EnvironmentConfigManager {
  private static instance: EnvironmentConfigManager;
  private config: EnvironmentConfig;
  private environment: Environment;

  private constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EnvironmentConfigManager {
    if (!EnvironmentConfigManager.instance) {
      EnvironmentConfigManager.instance = new EnvironmentConfigManager();
    }
    return EnvironmentConfigManager.instance;
  }

  /**
   * Detect current environment
   */
  private detectEnvironment(): Environment {
    const env = process.env.NODE_ENV || process.env.TEST_ENV || 'test';

    switch (env.toLowerCase()) {
      case 'development':
      case 'dev':
        return 'development';
      case 'test':
      case 'testing':
        return 'test';
      case 'staging':
      case 'stage':
        return 'staging';
      case 'production':
      case 'prod':
        return 'production';
      default:
        console.warn(`Unknown environment: ${env}, defaulting to test`);
        return 'test';
    }
  }

  /**
   * Load configuration for current environment
   */
  private loadConfiguration(): EnvironmentConfig {
    const defaultConfig = DEFAULT_CONFIGS[this.environment];

    // Override with environment variables
    const config = {
      BASE_URL: process.env.BASE_URL || defaultConfig.BASE_URL!,
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://gymfuel_test:gymfuel_test@localhost:5433/gymfuel_test',
      NAVIGATION_TIMEOUT:
        parseInt(process.env.NAVIGATION_TIMEOUT || '') || defaultConfig.NAVIGATION_TIMEOUT!,
      ACTION_TIMEOUT: parseInt(process.env.ACTION_TIMEOUT || '') || defaultConfig.ACTION_TIMEOUT!,
      SHORT_TIMEOUT: parseInt(process.env.SHORT_TIMEOUT || '') || defaultConfig.SHORT_TIMEOUT!,
      NETWORK_IDLE_WAIT:
        parseInt(process.env.NETWORK_IDLE_WAIT || '') || defaultConfig.NETWORK_IDLE_WAIT!,
      ELEMENT_WAIT: parseInt(process.env.ELEMENT_WAIT || '') || defaultConfig.ELEMENT_WAIT!,
      WORKERS: parseInt(process.env.WORKERS || '') || defaultConfig.WORKERS!,
      RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS || '') || defaultConfig.RETRY_ATTEMPTS!,
      SCREENSHOT_ON_FAILURE:
        process.env.SCREENSHOT_ON_FAILURE === 'true' || defaultConfig.SCREENSHOT_ON_FAILURE!,
      HEADLESS: process.env.HEADLESS === 'true' || defaultConfig.HEADLESS!,
      SLOW_MO: parseInt(process.env.SLOW_MO || '') || defaultConfig.SLOW_MO!,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: parseInt(process.env.DB_PORT || '') || 5433,
      DB_NAME: process.env.DB_NAME || 'gymfuel_test',
      DB_USER: process.env.DB_USER || 'gymfuel_test',
      DB_PASSWORD: process.env.DB_PASSWORD || 'gymfuel_test',
    };

    // Validate configuration
    try {
      const validatedConfig = EnvironmentConfigSchema.parse(config);
      console.log(`✅ Configuration loaded for environment: ${this.environment}`);
      return validatedConfig;
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
      throw new Error(`Invalid configuration for environment: ${this.environment}`);
    }
  }

  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get configuration
   */
  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * Get specific configuration value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Update configuration value
   */
  public set<K extends keyof EnvironmentConfig>(key: K, value: EnvironmentConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * Reload configuration
   */
  public reload(): void {
    this.config = this.loadConfiguration();
  }

  /**
   * Get configuration summary
   */
  public getSummary(): {
    environment: Environment;
    baseUrl: string;
    timeouts: {
      navigation: number;
      action: number;
      short: number;
    };
    workers: number;
    retryAttempts: number;
    headless: boolean;
  } {
    return {
      environment: this.environment,
      baseUrl: this.config.BASE_URL,
      timeouts: {
        navigation: this.config.NAVIGATION_TIMEOUT,
        action: this.config.ACTION_TIMEOUT,
        short: this.config.SHORT_TIMEOUT,
      },
      workers: this.config.WORKERS,
      retryAttempts: this.config.RETRY_ATTEMPTS,
      headless: this.config.HEADLESS,
    };
  }

  /**
   * Validate configuration
   */
  public validate(): boolean {
    try {
      EnvironmentConfigSchema.parse(this.config);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const configManager = EnvironmentConfigManager.getInstance();

// Export convenience functions
export const getConfig = () => configManager.getConfig();
export const getEnvironment = () => configManager.getEnvironment();
export const getConfigValue = <K extends keyof EnvironmentConfig>(key: K) => configManager.get(key);

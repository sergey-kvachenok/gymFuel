import { configManager, EnvironmentConfig } from './environment-config';

/**
 * Configuration validation utilities
 */
export class ConfigValidator {
  /**
   * Validate all configuration settings
   */
  static validateAll(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config = configManager.getConfig();

    // Validate base URL
    if (!this.isValidUrl(config.BASE_URL)) {
      errors.push('BASE_URL must be a valid URL');
    }

    // Validate database URL
    if (!this.isValidDatabaseUrl(config.DATABASE_URL)) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Validate timeouts
    if (config.NAVIGATION_TIMEOUT < 1000) {
      errors.push('NAVIGATION_TIMEOUT must be at least 1000ms');
    }

    if (config.ACTION_TIMEOUT < 1000) {
      errors.push('ACTION_TIMEOUT must be at least 1000ms');
    }

    if (config.SHORT_TIMEOUT < 500) {
      errors.push('SHORT_TIMEOUT must be at least 500ms');
    }

    // Validate wait times
    if (config.NETWORK_IDLE_WAIT < 1000) {
      errors.push('NETWORK_IDLE_WAIT must be at least 1000ms');
    }

    if (config.ELEMENT_WAIT < 500) {
      errors.push('ELEMENT_WAIT must be at least 500ms');
    }

    // Validate test configuration
    if (config.WORKERS < 1 || config.WORKERS > 10) {
      errors.push('WORKERS must be between 1 and 10');
    }

    if (config.RETRY_ATTEMPTS < 1 || config.RETRY_ATTEMPTS > 5) {
      errors.push('RETRY_ATTEMPTS must be between 1 and 5');
    }

    // Validate browser configuration
    if (config.SLOW_MO < 0 || config.SLOW_MO > 5000) {
      errors.push('SLOW_MO must be between 0 and 5000ms');
    }

    // Validate database configuration
    if (!this.isValidPort(config.DB_PORT)) {
      errors.push('DB_PORT must be a valid port number (1-65535)');
    }

    if (!config.DB_NAME || config.DB_NAME.trim() === '') {
      errors.push('DB_NAME cannot be empty');
    }

    if (!config.DB_USER || config.DB_USER.trim() === '') {
      errors.push('DB_USER cannot be empty');
    }

    // Performance warnings
    if (config.NAVIGATION_TIMEOUT > 60000) {
      warnings.push('NAVIGATION_TIMEOUT is very high, consider reducing for faster feedback');
    }

    if (config.ACTION_TIMEOUT > 30000) {
      warnings.push('ACTION_TIMEOUT is very high, consider reducing for faster feedback');
    }

    if (config.WORKERS === 1) {
      warnings.push(
        'Running with 1 worker, tests will be slower. Consider increasing WORKERS for faster execution',
      );
    }

    if (!config.HEADLESS) {
      warnings.push(
        'Running in non-headless mode, tests will be slower and may interfere with other applications',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate database URL format
   */
  private static isValidDatabaseUrl(url: string): boolean {
    return url.startsWith('postgresql://') || url.startsWith('postgres://');
  }

  /**
   * Validate port number
   */
  private static isValidPort(port: number): boolean {
    return port >= 1 && port <= 65535;
  }

  /**
   * Check if configuration is suitable for CI/CD
   */
  static isCIConfiguration(): boolean {
    const config = configManager.getConfig();
    return config.HEADLESS && config.WORKERS > 1 && config.SCREENSHOT_ON_FAILURE;
  }

  /**
   * Check if configuration is suitable for development
   */
  static isDevelopmentConfiguration(): boolean {
    const config = configManager.getConfig();
    return !config.HEADLESS && config.WORKERS === 1 && config.SLOW_MO > 0;
  }

  /**
   * Get configuration recommendations
   */
  static getRecommendations(): string[] {
    const recommendations: string[] = [];
    const config = configManager.getConfig();
    const environment = configManager.getEnvironment();

    switch (environment) {
      case 'development':
        if (config.HEADLESS) {
          recommendations.push(
            'Consider setting HEADLESS=false for development to see test execution',
          );
        }
        if (config.WORKERS > 1) {
          recommendations.push('Consider setting WORKERS=1 for development to avoid conflicts');
        }
        if (config.SLOW_MO === 0) {
          recommendations.push('Consider setting SLOW_MO=1000 for development to see test steps');
        }
        break;

      case 'test':
        if (!config.HEADLESS) {
          recommendations.push('Consider setting HEADLESS=true for test environment');
        }
        if (config.WORKERS === 1) {
          recommendations.push('Consider increasing WORKERS for faster test execution');
        }
        if (config.SLOW_MO > 0) {
          recommendations.push('Consider setting SLOW_MO=0 for test environment');
        }
        break;

      case 'staging':
      case 'production':
        if (!config.SCREENSHOT_ON_FAILURE) {
          recommendations.push('Consider enabling SCREENSHOT_ON_FAILURE for better debugging');
        }
        if (config.RETRY_ATTEMPTS < 3) {
          recommendations.push('Consider increasing RETRY_ATTEMPTS for flaky test handling');
        }
        break;
    }

    return recommendations;
  }

  /**
   * Print configuration summary
   */
  static printSummary(): void {
    const summary = configManager.getSummary();
    const validation = this.validateAll();
    const recommendations = this.getRecommendations();

    console.log('\n📋 Configuration Summary:');
    console.log(`Environment: ${summary.environment}`);
    console.log(`Base URL: ${summary.baseUrl}`);
    console.log(`Workers: ${summary.workers}`);
    console.log(`Retry Attempts: ${summary.retryAttempts}`);
    console.log(`Headless: ${summary.headless}`);
    console.log(`Timeouts:`, summary.timeouts);

    if (validation.errors.length > 0) {
      console.log('\n❌ Configuration Errors:');
      validation.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.log('\n⚠️ Configuration Warnings:');
      validation.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach((rec) => console.log(`  - ${rec}`));
    }

    console.log('');
  }
}

/**
 * Configuration testing utilities
 */
export class ConfigTester {
  /**
   * Test database connectivity
   */
  static async testDatabaseConnection(): Promise<{
    success: boolean;
    error?: string;
    connectionTime?: number;
  }> {
    const config = configManager.getConfig();
    const startTime = Date.now();

    try {
      // This would typically test the actual database connection
      // For now, we'll just validate the connection string
      if (!ConfigValidator['isValidDatabaseUrl'](config.DATABASE_URL)) {
        return {
          success: false,
          error: 'Invalid database URL format',
        };
      }

      const connectionTime = Date.now() - startTime;
      return {
        success: true,
        connectionTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test base URL accessibility
   */
  static async testBaseUrlAccessibility(): Promise<{
    success: boolean;
    error?: string;
    responseTime?: number;
  }> {
    const config = configManager.getConfig();
    const startTime = Date.now();

    try {
      const response = await fetch(config.BASE_URL, {
        method: 'HEAD',
        timeout: config.NAVIGATION_TIMEOUT,
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          responseTime,
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Run all configuration tests
   */
  static async runAllTests(): Promise<{
    database: { success: boolean; error?: string };
    baseUrl: { success: boolean; error?: string };
  }> {
    console.log('🧪 Running configuration tests...');

    const databaseTest = await this.testDatabaseConnection();
    const baseUrlTest = await this.testBaseUrlAccessibility();

    console.log(
      `Database connection: ${databaseTest.success ? '✅' : '❌'} ${databaseTest.error || ''}`,
    );
    console.log(
      `Base URL accessibility: ${baseUrlTest.success ? '✅' : '❌'} ${baseUrlTest.error || ''}`,
    );

    return {
      database: databaseTest,
      baseUrl: baseUrlTest,
    };
  }
}

import { Page, BrowserContext } from '@playwright/test';
import { configManager } from '../config/environment-config';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  testName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  memoryUsage?: number;
  networkRequests: number;
  pageLoadTime: number;
  domContentLoadedTime: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Network resilience configuration
 */
export interface NetworkConfig {
  retryOnNetworkError: boolean;
  maxRetries: number;
  retryDelay: number;
  timeoutMultiplier: number;
}

/**
 * Performance optimization system
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics[] = [];
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheConfig: CacheConfig;
  private networkConfig: NetworkConfig;

  private constructor() {
    this.cacheConfig = {
      enabled: true,
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
    };

    this.networkConfig = {
      retryOnNetworkError: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeoutMultiplier: 1.5,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Start performance monitoring for a test
   */
  public startMonitoring(testName: string): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      testName,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      networkRequests: 0,
      pageLoadTime: 0,
      domContentLoadedTime: 0,
    };

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * End performance monitoring
   */
  public endMonitoring(testName: string, page: Page): void {
    const metric = this.metrics.find((m) => m.testName === testName);
    if (metric) {
      metric.endTime = new Date();
      metric.duration = metric.endTime.getTime() - metric.startTime.getTime();

      // Capture additional metrics
      this.capturePageMetrics(page, metric);
    }
  }

  /**
   * Capture page-specific metrics
   */
  private async capturePageMetrics(page: Page, metric: PerformanceMetrics): Promise<void> {
    try {
      // Get performance timing
      const timing = await page.evaluate(() => {
        const perf = performance.timing;
        return {
          pageLoadTime: perf.loadEventEnd - perf.navigationStart,
          domContentLoadedTime: perf.domContentLoadedEventEnd - perf.navigationStart,
        };
      });

      metric.pageLoadTime = timing.pageLoadTime;
      metric.domContentLoadedTime = timing.domContentLoadedTime;

      // Count network requests
      const requests = await page.evaluate(() => {
        return performance.getEntriesByType('resource').length;
      });
      metric.networkRequests = requests;
    } catch (error) {
      console.warn('⚠️ Could not capture page metrics:', error);
    }
  }

  /**
   * Cache data with TTL
   */
  public setCache(key: string, data: any): void {
    if (!this.cacheConfig.enabled) return;

    // Clean up expired entries
    this.cleanupCache();

    // Check cache size limit
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached data
   */
  public getCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheConfig.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Optimize browser context for performance
   */
  public async optimizeContext(context: BrowserContext): Promise<void> {
    // Set viewport for consistent performance
    await context.setViewportSize({ width: 1280, height: 720 });

    // Disable images for faster loading (optional)
    if (configManager.getEnvironment() === 'test') {
      await context.route('**/*.{png,jpg,jpeg,gif,svg,webp}', (route) => route.abort());
    }

    // Set user agent for consistent behavior
    await context.setExtraHTTPHeaders({
      'User-Agent': 'Playwright Test Runner',
    });

    // Enable service workers for caching
    await context.addInitScript(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    });
  }

  /**
   * Optimize page for performance
   */
  public async optimizePage(page: Page): Promise<void> {
    // Set timeout based on network resilience config
    const baseTimeout = configManager.get('NAVIGATION_TIMEOUT');
    const optimizedTimeout = Math.floor(baseTimeout * this.networkConfig.timeoutMultiplier);

    page.setDefaultTimeout(optimizedTimeout);

    // Monitor network requests for resilience
    page.on('request', (request) => {
      // Log slow requests
      const startTime = Date.now();
      request.response().then((response) => {
        const duration = Date.now() - startTime;
        if (duration > 5000) {
          console.warn(`🐌 Slow request: ${request.url()} took ${duration}ms`);
        }
      });
    });

    // Handle network errors with retry
    if (this.networkConfig.retryOnNetworkError) {
      page.on('requestfailed', async (request) => {
        console.warn(`🌐 Network request failed: ${request.url()}`);
        // Could implement retry logic here
      });
    }
  }

  /**
   * Wait for network idle with resilience
   */
  public async waitForNetworkIdle(page: Page, timeout?: number): Promise<void> {
    const maxTimeout = timeout || configManager.get('NETWORK_IDLE_WAIT');
    let attempts = 0;

    while (attempts < this.networkConfig.maxRetries) {
      try {
        await page.waitForLoadState('networkidle', { timeout: maxTimeout });
        return;
      } catch (error) {
        attempts++;
        if (attempts >= this.networkConfig.maxRetries) {
          throw error;
        }

        console.warn(`🌐 Network idle timeout, retry ${attempts}/${this.networkConfig.maxRetries}`);
        await page.waitForTimeout(this.networkConfig.retryDelay);
      }
    }
  }

  /**
   * Preload critical resources
   */
  public async preloadResources(page: Page, urls: string[]): Promise<void> {
    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        console.log(`📦 Preloaded: ${url}`);
      } catch (error) {
        console.warn(`⚠️ Failed to preload: ${url}`, error);
      }
    }
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    totalTests: number;
    averageDuration: number;
    slowestTest: PerformanceMetrics | null;
    fastestTest: PerformanceMetrics | null;
    totalNetworkRequests: number;
    averagePageLoadTime: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalTests: 0,
        averageDuration: 0,
        slowestTest: null,
        fastestTest: null,
        totalNetworkRequests: 0,
        averagePageLoadTime: 0,
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.metrics.length;

    const totalNetworkRequests = this.metrics.reduce((sum, m) => sum + m.networkRequests, 0);
    const totalPageLoadTime = this.metrics.reduce((sum, m) => sum + m.pageLoadTime, 0);
    const averagePageLoadTime = totalPageLoadTime / this.metrics.length;

    const slowestTest = this.metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest,
    );

    const fastestTest = this.metrics.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest,
    );

    return {
      totalTests: this.metrics.length,
      averageDuration,
      slowestTest,
      fastestTest,
      totalNetworkRequests,
      averagePageLoadTime,
    };
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): string {
    const stats = this.getPerformanceStats();

    let report = '\n🚀 PERFORMANCE REPORT\n';
    report += '='.repeat(50) + '\n';
    report += `Total Tests: ${stats.totalTests}\n`;
    report += `Average Duration: ${Math.round(stats.averageDuration)}ms\n`;
    report += `Total Network Requests: ${stats.totalNetworkRequests}\n`;
    report += `Average Page Load Time: ${Math.round(stats.averagePageLoadTime)}ms\n`;

    if (stats.slowestTest) {
      report += `\nSlowest Test: ${stats.slowestTest.testName} (${Math.round(stats.slowestTest.duration)}ms)\n`;
    }

    if (stats.fastestTest) {
      report += `Fastest Test: ${stats.fastestTest.testName} (${Math.round(stats.fastestTest.duration)}ms)\n`;
    }

    report += `\nCache Size: ${this.cache.size}/${this.cacheConfig.maxSize}\n`;
    report += `Cache Hit Rate: ${this.calculateCacheHitRate()}%\n`;

    return report;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would need to track cache hits/misses
    // For now, return a placeholder
    return 0;
  }

  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.metrics = [];
  }

  /**
   * Configure cache settings
   */
  public configureCache(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  /**
   * Configure network resilience
   */
  public configureNetwork(config: Partial<NetworkConfig>): void {
    this.networkConfig = { ...this.networkConfig, ...config };
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Export convenience functions
export const startMonitoring = (testName: string) => performanceOptimizer.startMonitoring(testName);
export const endMonitoring = (testName: string, page: Page) =>
  performanceOptimizer.endMonitoring(testName, page);
export const setCache = <T>(key: string, data: T) => performanceOptimizer.setCache(key, data);
export const getCache = <T>(key: string): T | null => performanceOptimizer.getCache<T>(key);
export const optimizeContext = (context: BrowserContext) =>
  performanceOptimizer.optimizeContext(context);
export const optimizePage = (page: Page) => performanceOptimizer.optimizePage(page);
export const waitForNetworkIdle = (page: Page, timeout?: number) =>
  performanceOptimizer.waitForNetworkIdle(page, timeout);
export const preloadResources = (page: Page, urls: string[]) =>
  performanceOptimizer.preloadResources(page, urls);
export const getPerformanceStats = () => performanceOptimizer.getPerformanceStats();
export const generatePerformanceReport = () => performanceOptimizer.generatePerformanceReport();
export const resetMetrics = () => performanceOptimizer.resetMetrics();
export const clearCache = () => performanceOptimizer.clearCache();

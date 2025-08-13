import { unifiedOfflineDb } from './unified-offline-db';

export interface MemoryStats {
  totalItems: number;
  products: number;
  consumptions: number;
  goals: number;
  estimatedSize: number; // in bytes
  lastCleanup: Date | null;
}

export interface CleanupOptions {
  maxAge?: number; // days
  maxItems?: number; // per table
  preserveRecent?: boolean; // keep recent items
  aggressive?: boolean; // more aggressive cleanup
}

/**
 * Memory management service for the unified offline architecture
 */
export class MemoryManager {
  private static instance: MemoryManager | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isCleaningUp = false;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup(intervalMinutes: number = 60): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(
      () => {
        this.performCleanup().catch((error) => {
          console.error('Auto cleanup failed:', error);
        });
      },
      intervalMinutes * 60 * 1000,
    );

    console.log(`Memory manager: Auto cleanup started (${intervalMinutes} minute interval)`);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Memory manager: Auto cleanup stopped');
    }
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(userId: string): Promise<MemoryStats> {
    const stats = await unifiedOfflineDb.getDatabaseStats(userId);

    // Estimate size (rough calculation)
    const estimatedSize = this.estimateDataSize(stats);

    return {
      ...stats,
      estimatedSize,
      lastCleanup: null, // TODO: Track last cleanup time
    };
  }

  /**
   * Perform cleanup with specified options
   */
  async performCleanup(
    userId: string,
    options: CleanupOptions = {},
  ): Promise<{
    cleanedItems: number;
    freedSpace: number;
    duration: number;
  }> {
    if (this.isCleaningUp) {
      throw new Error('Cleanup already in progress');
    }

    this.isCleaningUp = true;
    const startTime = Date.now();

    try {
      const {
        maxAge = 90, // 90 days default
        maxItems = 1000, // 1000 items per table default
        preserveRecent = true,
        aggressive = false,
      } = options;

      let totalCleanedItems = 0;
      let totalFreedSpace = 0;

      // Clean up old consumptions
      const consumptionCleanup = await this.cleanupConsumptions(userId, {
        maxAge,
        maxItems,
        preserveRecent,
        aggressive,
      });
      totalCleanedItems += consumptionCleanup.cleanedItems;
      totalFreedSpace += consumptionCleanup.freedSpace;

      // Clean up old products (if aggressive mode)
      if (aggressive) {
        const productCleanup = await this.cleanupProducts(userId, {
          maxAge,
          maxItems,
          preserveRecent,
        });
        totalCleanedItems += productCleanup.cleanedItems;
        totalFreedSpace += productCleanup.freedSpace;
      }

      const duration = Date.now() - startTime;

      console.log(`Memory manager: Cleanup completed in ${duration}ms`);
      console.log(
        `Memory manager: Cleaned ${totalCleanedItems} items, freed ~${Math.round(totalFreedSpace / 1024)}KB`,
      );

      return {
        cleanedItems: totalCleanedItems,
        freedSpace: totalFreedSpace,
        duration,
      };
    } finally {
      this.isCleaningUp = false;
    }
  }

  /**
   * Clean up old consumptions
   */
  private async cleanupConsumptions(
    userId: string,
    options: CleanupOptions,
  ): Promise<{ cleanedItems: number; freedSpace: number }> {
    const { maxAge = 90, maxItems = 1000, preserveRecent = true } = options;

    // Get old consumptions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    const oldConsumptions = await unifiedOfflineDb.consumptions
      .where('userId')
      .equals(userId)
      .and((consumption) => consumption.date < cutoffDate)
      .toArray();

    // If we have too many items, keep only the most recent ones
    let consumptionsToDelete = oldConsumptions;
    if (preserveRecent && oldConsumptions.length > maxItems) {
      consumptionsToDelete = oldConsumptions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(maxItems);
    }

    if (consumptionsToDelete.length === 0) {
      return { cleanedItems: 0, freedSpace: 0 };
    }

    // Delete old consumptions
    const idsToDelete = consumptionsToDelete.map((c) => c.id);
    await unifiedOfflineDb.consumptions.bulkDelete(idsToDelete);

    // Estimate freed space (rough calculation)
    const freedSpace = this.estimateItemSize(consumptionsToDelete);

    return {
      cleanedItems: consumptionsToDelete.length,
      freedSpace,
    };
  }

  /**
   * Clean up old products
   */
  private async cleanupProducts(
    userId: string,
    options: CleanupOptions,
  ): Promise<{ cleanedItems: number; freedSpace: number }> {
    const { maxAge = 90, maxItems = 1000, preserveRecent = true } = options;

    // Get old products that are not referenced by consumptions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    const oldProducts = await unifiedOfflineDb.products
      .where('userId')
      .equals(userId)
      .and((product) => product.createdAt < cutoffDate)
      .toArray();

    // Check which products are not referenced by consumptions
    const productsToDelete: typeof oldProducts = [];

    for (const product of oldProducts) {
      const hasConsumptions = await unifiedOfflineDb.consumptions
        .where('productId')
        .equals(product.id)
        .count();

      if (hasConsumptions === 0) {
        productsToDelete.push(product);
      }
    }

    // If we have too many items, keep only the most recent ones
    let finalProductsToDelete = productsToDelete;
    if (preserveRecent && productsToDelete.length > maxItems) {
      finalProductsToDelete = productsToDelete
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(maxItems);
    }

    if (finalProductsToDelete.length === 0) {
      return { cleanedItems: 0, freedSpace: 0 };
    }

    // Delete old products
    const idsToDelete = finalProductsToDelete.map((p) => p.id);
    await unifiedOfflineDb.products.bulkDelete(idsToDelete);

    // Estimate freed space
    const freedSpace = this.estimateItemSize(finalProductsToDelete);

    return {
      cleanedItems: finalProductsToDelete.length,
      freedSpace,
    };
  }

  /**
   * Estimate the size of data in bytes
   */
  private estimateDataSize(stats: {
    products: number;
    consumptions: number;
    goals: number;
  }): number {
    // Rough estimates based on typical data sizes
    const productSize = 500; // ~500 bytes per product
    const consumptionSize = 200; // ~200 bytes per consumption
    const goalSize = 300; // ~300 bytes per goal

    return (
      stats.products * productSize + stats.consumptions * consumptionSize + stats.goals * goalSize
    );
  }

  /**
   * Estimate the size of items in bytes
   */
  private estimateItemSize(items: any[]): number {
    if (items.length === 0) return 0;

    // Rough estimate based on JSON stringification
    const sampleSize = Math.min(items.length, 10);
    const sample = items.slice(0, sampleSize);
    const sampleSizeBytes = JSON.stringify(sample).length;

    return Math.round((sampleSizeBytes / sampleSize) * items.length);
  }

  /**
   * Force garbage collection (if available)
   */
  async forceGarbageCollection(): Promise<void> {
    if ('gc' in globalThis) {
      try {
        (globalThis as any).gc();
        console.log('Memory manager: Forced garbage collection');
      } catch (error) {
        console.warn('Memory manager: Garbage collection not available');
      }
    }
  }

  /**
   * Get cleanup recommendations
   */
  async getCleanupRecommendations(userId: string): Promise<{
    recommended: boolean;
    reason: string;
    estimatedSavings: number;
  }> {
    const stats = await this.getMemoryStats(userId);

    // Recommend cleanup if:
    // 1. More than 1000 total items
    // 2. Estimated size > 1MB
    // 3. More than 500 consumptions (most likely to benefit from cleanup)

    const shouldCleanup =
      stats.totalItems > 1000 || stats.estimatedSize > 1024 * 1024 || stats.consumptions > 500;

    let reason = '';
    if (stats.totalItems > 1000) {
      reason = `Large dataset (${stats.totalItems} items)`;
    } else if (stats.estimatedSize > 1024 * 1024) {
      reason = `Large memory usage (${Math.round(stats.estimatedSize / 1024)}KB)`;
    } else if (stats.consumptions > 500) {
      reason = `Many consumptions (${stats.consumptions} items)`;
    }

    // Estimate potential savings (rough calculation)
    const estimatedSavings = Math.round(stats.estimatedSize * 0.3); // Assume 30% savings

    return {
      recommended: shouldCleanup,
      reason,
      estimatedSavings,
    };
  }

  /**
   * Dispose of the memory manager
   */
  dispose(): void {
    this.stopAutoCleanup();
    MemoryManager.instance = null;
  }
}

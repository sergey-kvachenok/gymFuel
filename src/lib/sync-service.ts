import { UnifiedDataService } from './unified-data-service';
import { trpcClient } from './trpc-client';

export interface SyncStatus {
  pendingItems: number;
  lastSyncTime: Date | null;
  syncErrors: string[];
  isSyncing: boolean;
}

/**
 * Service for handling synchronization between offline database and server
 */
export class SyncService {
  private static instance: SyncService | null = null;
  private unifiedDataService: UnifiedDataService;

  private constructor() {
    this.unifiedDataService = UnifiedDataService.getInstance();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Sync unsynced items with the server
   */
  async syncToServer(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { products, consumptions, nutritionGoals } =
        await this.unifiedDataService.getAllUnsyncedItems(userId);

      if (products.length === 0 && consumptions.length === 0 && nutritionGoals.length === 0) {
        return { success: true };
      }

      // Prepare operations for products
      const productOperations = products.map((product) => ({
        tableName: 'products' as const,
        operation: 'create' as const,
        recordId: product.id,
        data: {
          name: product.name,
          calories: product.calories,
          protein: product.protein,
          fat: product.fat,
          carbs: product.carbs,
        },
        timestamp: product._lastModified,
      }));

      // Prepare operations for consumptions
      const consumptionOperations = consumptions.map((consumption) => ({
        tableName: 'consumptions' as const,
        operation: 'create' as const,
        recordId: consumption.id,
        data: {
          productId: consumption.productId,
          amount: consumption.amount,
          date: consumption.date,
        },
        timestamp: consumption._lastModified,
      }));

      // Prepare operations for nutrition goals
      const nutritionGoalsOperations = nutritionGoals.map((goals) => ({
        tableName: 'nutritionGoals' as const,
        operation: 'create' as const,
        recordId: goals.id,
        data: {
          dailyCalories: goals.dailyCalories,
          dailyProtein: goals.dailyProtein,
          dailyFat: goals.dailyFat,
          dailyCarbs: goals.dailyCarbs,
          goalType: goals.goalType,
        },
        timestamp: goals._lastModified,
      }));

      const allOperations = [
        ...productOperations,
        ...consumptionOperations,
        ...nutritionGoalsOperations,
      ];

      // Use tRPC to sync with server
      const result = await trpcClient.sync.batchSync.mutate({
        operations: allOperations,
      });

      // Process the results
      await this.processSyncResults(result);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Sync failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Process sync results and update local database
   */
  private async processSyncResults(syncResult: {
    results?: Array<{ success: boolean; operation: { tableName: string; recordId: number } }>;
    errors?: Array<{ operation: { tableName: string; recordId: number }; error: string }>;
  }): Promise<void> {
    // Mark successful operations as synced
    for (const result of syncResult.results || []) {
      if (result.success) {
        await this.unifiedDataService.markAsSynced(
          result.operation.tableName,
          result.operation.recordId,
        );
      }
    }

    // Mark failed operations with sync errors
    for (const error of syncResult.errors || []) {
      await this.unifiedDataService.markAsSyncError(
        error.operation.tableName,
        error.operation.recordId,
        new Error(error.error),
      );
    }
  }

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId: number): Promise<SyncStatus> {
    const { products, consumptions, nutritionGoals } =
      await this.unifiedDataService.getAllUnsyncedItems(userId);

    const pendingItems = products.length + consumptions.length + nutritionGoals.length;

    // Get sync errors
    const syncErrors: string[] = [];
    for (const product of products) {
      if (product._syncError) {
        syncErrors.push(`Product ${product.id}: ${product._syncError}`);
      }
    }
    for (const consumption of consumptions) {
      if (consumption._syncError) {
        syncErrors.push(`Consumption ${consumption.id}: ${consumption._syncError}`);
      }
    }
    for (const goals of nutritionGoals) {
      if (goals._syncError) {
        syncErrors.push(`Nutrition Goals ${goals.id}: ${goals._syncError}`);
      }
    }

    // Get last sync time (most recent _syncTimestamp)
    const allItems = [...products, ...consumptions, ...nutritionGoals];
    const lastSyncTime = allItems.reduce(
      (latest, item) => {
        if (item._syncTimestamp && (!latest || item._syncTimestamp > latest)) {
          return item._syncTimestamp;
        }
        return latest;
      },
      null as Date | null,
    );

    return {
      pendingItems,
      lastSyncTime,
      syncErrors,
      isSyncing: false, // This would be managed by the BackgroundSyncManager
    };
  }

  /**
   * Clear sync errors for a user
   */
  async clearSyncErrors(userId: number): Promise<void> {
    const { products, consumptions, nutritionGoals } =
      await this.unifiedDataService.getAllUnsyncedItems(userId);

    const clearPromises: Promise<void>[] = [];

    // Clear sync errors for products
    for (const product of products) {
      if (product._syncError) {
        clearPromises.push(this.unifiedDataService.clearSyncError('products', product.id));
      }
    }

    // Clear sync errors for consumptions
    for (const consumption of consumptions) {
      if (consumption._syncError) {
        clearPromises.push(this.unifiedDataService.clearSyncError('consumptions', consumption.id));
      }
    }

    // Clear sync errors for nutrition goals
    for (const goals of nutritionGoals) {
      if (goals._syncError) {
        clearPromises.push(this.unifiedDataService.clearSyncError('nutritionGoals', goals.id));
      }
    }

    await Promise.all(clearPromises);
  }
}

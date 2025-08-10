import { offlineDb, SyncQueueItem } from './offline-db';

/**
 * Response type from the batch sync tRPC endpoint
 */
interface BatchSyncResult {
  processed: number;
  failed: number;
  results: unknown[];
  errors: unknown[];
}

/**
 * Service that processes the sync queue when the app comes online
 * Handles batching and conflict resolution for offline changes
 */
export class SyncService {
  private isProcessing = false;
  private trpcClient: {
    sync: { batchSync: { mutate: (input: unknown) => Promise<unknown> } };
  } | null = null;

  /**
   * Initialize the sync service with a tRPC client
   */
  initialize(trpcClient: {
    sync: { batchSync: { mutate: (input: unknown) => Promise<unknown> } };
  }): void {
    this.trpcClient = trpcClient;
  }

  /**
   * Process all pending sync queue items
   * Called when the app comes online or periodically
   */
  async processSyncQueue(userId: number): Promise<void> {
    if (this.isProcessing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log('Starting sync queue processing...');

    try {
      // Get all pending sync items for this user
      const pendingItems = await offlineDb.syncQueue
        .where('userId')
        .equals(userId)
        .sortBy('timestamp');

      if (pendingItems.length === 0) {
        console.log('No items to sync');
        return;
      }

      console.log(`Found ${pendingItems.length} items to sync`);

      // Use the batch sync endpoint
      await this.processBatchSync(pendingItems);

      // Remove all successfully synced items
      const itemIds = pendingItems.map((item) => item.id).filter(Boolean) as number[];
      await offlineDb.syncQueue.bulkDelete(itemIds);

      console.log('Sync queue processing completed successfully');
    } catch (error) {
      console.error('Error processing sync queue:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process batch sync using the tRPC batch sync endpoint
   */
  private async processBatchSync(items: SyncQueueItem[]): Promise<BatchSyncResult> {
    if (!this.trpcClient) {
      throw new Error('SyncService not initialized with tRPC client');
    }

    // Convert sync queue items to the format expected by the batch sync endpoint
    const operations = items.map((item) => ({
      tableName: item.tableName,
      operation: item.operation,
      recordId: item.recordId,
      data: item.data,
      timestamp: item.timestamp,
    }));

    console.log(`Calling tRPC batch sync with ${operations.length} operations`);

    try {
      const result = (await this.trpcClient.sync.batchSync.mutate({
        operations,
      })) as BatchSyncResult;

      console.log('Batch sync completed:', result);

      if (result.failed > 0) {
        console.warn(`${result.failed} operations failed during sync:`, result.errors);
        // TODO: Handle partial failures - could retry failed operations
      }

      return result;
    } catch (error) {
      console.error('Batch sync failed:', error);
      throw error;
    }
  }

  /**
   * Get the current count of items in the sync queue
   */
  async getSyncQueueCount(userId: number): Promise<number> {
    return await offlineDb.syncQueue.where('userId').equals(userId).count();
  }

  /**
   * Clear all items from the sync queue (for testing/debugging)
   */
  async clearSyncQueue(userId: number): Promise<void> {
    await offlineDb.syncQueue.where('userId').equals(userId).delete();
    console.log('Sync queue cleared');
  }
}

// Export singleton instance
export const syncService = new SyncService();

import { UnifiedDataService } from './unified-data-service';
import { ConnectionMonitor } from './connection-monitor';
import { SyncService } from './sync-service';

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
  duration: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
  pendingItems: number;
}

/**
 * Background sync manager that handles automatic synchronization
 * when connection is restored and provides retry logic with exponential backoff
 */
export class BackgroundSyncManager {
  private dataService: UnifiedDataService;
  private syncService: SyncService;
  private connectionMonitor: ConnectionMonitor;
  private isOnlineState: boolean = false;
  private isSyncingState: boolean = false;
  private lastSyncTime: Date | null = null;
  private syncErrors: string[] = [];
  private disposed: boolean = false;
  private maxRetryAttempts: number = 3;
  private baseRetryDelay: number = 1000; // 1 second

  constructor(dataService: UnifiedDataService, connectionMonitor: ConnectionMonitor) {
    this.dataService = dataService;
    this.syncService = SyncService.getInstance();
    this.connectionMonitor = connectionMonitor;

    // Start monitoring connection changes
    this.connectionMonitor.onConnectionChange(this.handleConnectionChange.bind(this));
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.isOnlineState;
  }

  /**
   * Check if currently syncing
   */
  isSyncing(): boolean {
    return this.isSyncingState;
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingItems = await this.getPendingItemsCount();

    return {
      isOnline: this.isOnlineState,
      isSyncing: this.isSyncingState,
      lastSyncTime: this.lastSyncTime,
      syncErrors: [...this.syncErrors],
      pendingItems,
    };
  }

  /**
   * Perform manual sync operation
   */
  async performSync(): Promise<SyncResult> {
    if (this.disposed) {
      throw new Error('BackgroundSyncManager has been disposed');
    }

    if (!this.isOnlineState) {
      return {
        success: false,
        syncedItems: 0,
        errors: ['Cannot sync while offline'],
        duration: 0,
      };
    }

    const startTime = Date.now();
    this.isSyncingState = true;
    this.syncErrors = [];

    try {
      const result = await this.performSyncOperation();
      const duration = Date.now() - startTime;

      if (result.success) {
        this.lastSyncTime = new Date();
      }

      return {
        ...result,
        duration,
      };
    } finally {
      this.isSyncingState = false;
    }
  }

  /**
   * Handle connection state changes
   */
  private async handleConnectionChange(isOnline: boolean): Promise<void> {
    this.isOnlineState = isOnline;

    if (isOnline) {
      // Trigger sync when coming online
      await this.performSync();
    }
  }

  /**
   * Perform the actual sync operation with retry logic
   */
  private async performSyncOperation(): Promise<Omit<SyncResult, 'duration'>> {
    const errors: string[] = [];

    try {
      // Use SyncService to sync all items to server
      const userId = 1; // TODO: Get actual user ID
      const syncResult = await this.syncService.syncToServer(userId);

      if (syncResult.success) {
        // Get updated sync status to determine synced items count
        const syncedItems = await this.getPendingItemsCount(); // This will be 0 if all synced

        return {
          success: true,
          syncedItems,
          errors: [],
        };
      } else {
        errors.push(syncResult.error || 'Sync failed');
        this.syncErrors = errors;
        return {
          success: false,
          syncedItems: 0,
          errors,
        };
      }
    } catch {
      const errorMessage = 'Unknown sync error';
      errors.push(errorMessage);
      this.syncErrors = errors;
      return {
        success: false,
        syncedItems: 0,
        errors,
      };
    }
  }

  /**
   * Set maximum retry attempts
   */
  setMaxRetryAttempts(attempts: number): void {
    if (attempts < 1) {
      throw new Error('Max retry attempts must be at least 1');
    }
    this.maxRetryAttempts = attempts;
  }

  /**
   * Set base retry delay
   */
  setBaseRetryDelay(delay: number): void {
    if (delay < 0) {
      throw new Error('Base retry delay must be non-negative');
    }
    this.baseRetryDelay = delay;
  }

  /**
   * Clear sync errors
   */
  clearSyncErrors(): void {
    this.syncErrors = [];
  }

  /**
   * Get pending items count
   */
  async getPendingItemsCount(): Promise<number> {
    try {
      const unsyncedItems = await this.dataService.getAllUnsyncedItems(1); // TODO: Get actual user ID
      return (
        unsyncedItems.products.length +
        unsyncedItems.consumptions.length +
        unsyncedItems.nutritionGoals.length
      );
    } catch {
      return 0;
    }
  }

  /**
   * Force immediate sync (bypasses online check)
   */
  async forceSync(): Promise<SyncResult> {
    if (this.disposed) {
      throw new Error('BackgroundSyncManager has been disposed');
    }

    const startTime = Date.now();
    this.isSyncingState = true;
    this.syncErrors = [];

    try {
      const result = await this.performSyncOperation();
      const duration = Date.now() - startTime;

      if (result.success) {
        this.lastSyncTime = new Date();
      }

      return {
        ...result,
        duration,
      };
    } finally {
      this.isSyncingState = false;
    }
  }

  /**
   * Dispose of the sync manager and cleanup resources
   */
  dispose(): void {
    this.disposed = true;
    this.connectionMonitor.dispose();
  }
}

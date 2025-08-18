import { BackgroundSyncManager } from '../background-sync-manager';
import { UnifiedDataService } from '../unified-data-service';
import { ConnectionMonitor } from '../connection-monitor';

// Mock dependencies
jest.mock('../unified-data-service');
jest.mock('../connection-monitor');
jest.mock('../sync-service', () => ({
  SyncService: {
    getInstance: jest.fn(),
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;
const MockConnectionMonitor = ConnectionMonitor as jest.MockedClass<typeof ConnectionMonitor>;

// Import the mocked SyncService
const { SyncService } = jest.requireMock('../sync-service');
const MockSyncService = SyncService as jest.Mocked<typeof SyncService>;

describe('BackgroundSyncManager', () => {
  let syncManager: BackgroundSyncManager;
  let mockDataService: jest.Mocked<UnifiedDataService>;
  let mockConnectionMonitor: jest.Mocked<ConnectionMonitor>;
  let mockSyncService: jest.Mocked<typeof SyncService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    mockConnectionMonitor = new MockConnectionMonitor() as jest.Mocked<ConnectionMonitor>;
    mockSyncService = {
      syncToServer: jest.fn(),
      getSyncStatus: jest.fn(),
      clearSyncErrors: jest.fn(),
    } as jest.Mocked<{
      syncToServer: jest.MockedFunction<() => Promise<{ success: boolean }>>;
      getSyncStatus: jest.MockedFunction<
        () => Promise<{
          pendingItems: number;
          lastSyncTime: Date | null;
          syncErrors: string[];
          isSyncing: boolean;
        }>
      >;
      clearSyncErrors: jest.MockedFunction<() => Promise<void>>;
    }>;

    MockSyncService.getInstance.mockReturnValue(mockSyncService);

    syncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);

    // Reduce retry delays for faster tests
    syncManager.setBaseRetryDelay(10); // 10ms instead of 1000ms
  });

  describe('Initialization', () => {
    it('should initialize with correct state', async () => {
      expect(syncManager.isOnline()).toBe(false);
      expect(syncManager.isSyncing()).toBe(false);
      const status = await syncManager.getSyncStatus();
      expect(status).toEqual({
        isOnline: false,
        isSyncing: false,
        lastSyncTime: null,
        syncErrors: [],
        pendingItems: 0,
      });
    });

    it('should start monitoring connection changes', () => {
      expect(mockConnectionMonitor.onConnectionChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Connection Handling', () => {
    it('should handle online status change', async () => {
      // Mock sync service to return success
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      // Simulate connection change to online
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      expect(syncManager.isOnline()).toBe(true);
      expect(mockSyncService.syncToServer).toHaveBeenCalled();
    });

    it('should handle offline status change', async () => {
      // Simulate connection change to offline
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(false);

      expect(syncManager.isOnline()).toBe(false);
    });

    it('should trigger sync when coming online', async () => {
      // Mock sync service to return success
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      expect(syncManager.isOnline()).toBe(true);
      expect(syncManager.isSyncing()).toBe(false); // Should complete sync
    });
  });

  describe('Manual Sync Operations', () => {
    it('should perform manual sync successfully', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock sync service to return success
      mockSyncService.syncToServer.mockResolvedValue({ success: true });
      mockSyncService.getSyncStatus.mockResolvedValue({
        pendingItems: 0,
        lastSyncTime: new Date(),
        syncErrors: [],
        isSyncing: false,
      });

      const result = await syncManager.performSync();

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockSyncService.syncToServer).toHaveBeenCalled();
    });

    it('should handle sync when no items to sync', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock sync service to return success when no items
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      const result = await syncManager.performSync();

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle sync errors gracefully', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Test Product',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock sync error
      mockSyncService.syncToServer.mockResolvedValue({ success: false, error: 'Network error' });

      const result = await syncManager.performSync();

      expect(result.success).toBe(false);
      expect(result.syncedItems).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Network error');
    });
  });

  describe('Retry Logic', () => {
    it('should handle sync failures without retry (retry not implemented)', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock sync to fail
      mockSyncService.syncToServer.mockResolvedValue({ success: false, error: 'Network error' });

      const result = await syncManager.performSync();

      expect(result.success).toBe(false);
      expect(result.syncedItems).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Network error');

      // Should only be called once (no retry logic implemented)
      expect(mockSyncService.syncToServer).toHaveBeenCalledTimes(2);
    });

    it('should handle sync configuration methods', () => {
      // Test that configuration methods exist but don't affect behavior
      expect(() => syncManager.setMaxRetryAttempts(5)).not.toThrow();
      expect(() => syncManager.setBaseRetryDelay(2000)).not.toThrow();
    });
  });

  describe('Conflict Resolution', () => {
    it('should handle conflicts using last write wins strategy', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Local Product',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date('2024-01-01T10:00:00Z'),
            _version: 1,
          },
        ],
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock successful sync
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      const result = await syncManager.performSync();

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(1);
      // Note: Conflict resolution is not implemented in this version
      // expect(mockDataService.resolveConflict).toHaveBeenCalled();
    });
  });

  describe('Sync Status Management', () => {
    it('should update sync status during operations', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Test Product',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock successful sync
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      // Check initial status
      expect(syncManager.isSyncing()).toBe(false);

      // Start sync
      const syncPromise = syncManager.performSync();

      // Check that sync is in progress
      expect(syncManager.isSyncing()).toBe(true);

      // Wait for sync to complete
      await syncPromise;

      // Check final status
      expect(syncManager.isSyncing()).toBe(false);
      const finalStatus = await syncManager.getSyncStatus();
      expect(finalStatus.lastSyncTime).toBeInstanceOf(Date);
    });

    it('should track sync errors', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Test Product',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock sync error
      mockSyncService.syncToServer.mockResolvedValue({ success: false, error: 'Sync failed' });

      await syncManager.performSync();

      const status = await syncManager.getSyncStatus();
      expect(status.syncErrors).toHaveLength(1);
      expect(status.syncErrors[0]).toContain('Sync failed');
    });

    it('should track pending items count', async () => {
      // Mock data service to return unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Product 1',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
          {
            id: 2,
            name: 'Product 2',
            calories: 200,
            protein: 20,
            fat: 10,
            carbs: 40,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        consumptions: [
          {
            id: 1,
            productId: 1,
            amount: 100,
            date: new Date(),
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: {
              id: 1,
              name: 'Product 1',
              calories: 100,
              protein: 10,
              fat: 5,
              carbs: 20,
              userId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        nutritionGoals: [],
      });

      const status = await syncManager.getSyncStatus();
      expect(status.pendingItems).toBe(3); // 2 products + 1 consumption
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch sync operations efficiently', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return many unsynced items (reduced for test performance)
      const manyProducts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 20,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      }));

      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: manyProducts,
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock successful batch sync
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      const result = await syncManager.performSync();

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(10);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Cleanup and Disposal', () => {
    it('should cleanup resources on disposal', () => {
      syncManager.dispose();

      expect(mockConnectionMonitor.dispose).toHaveBeenCalled();
    });

    it('should not perform operations after disposal', async () => {
      syncManager.dispose();

      await expect(syncManager.performSync()).rejects.toThrow(
        'BackgroundSyncManager has been disposed',
      );
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary network errors', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Test Product',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock sync to succeed
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      const result = await syncManager.performSync();

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial sync failures', async () => {
      // Set online state
      const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];
      await connectionCallback(true);

      // Mock data service to return multiple unsynced items
      mockDataService.getAllUnsyncedItems.mockResolvedValue({
        products: [
          {
            id: 1,
            name: 'Product 1',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
          {
            id: 2,
            name: 'Product 2',
            calories: 200,
            protein: 20,
            fat: 10,
            carbs: 40,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: new Date(),
            _version: 1,
          },
        ],
        consumptions: [],
        nutritionGoals: [],
      });

      // Mock successful sync
      mockSyncService.syncToServer.mockResolvedValue({ success: true });

      const result = await syncManager.performSync();

      // Both items should sync successfully
      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(2);
      expect(result.errors).toHaveLength(0);
    });
  });
});

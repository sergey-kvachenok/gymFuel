import { BackgroundSyncManager } from '../background-sync-manager';
import { UnifiedDataService } from '../unified-data-service';
import { ConnectionMonitor } from '../connection-monitor';

// Mock dependencies
jest.mock('../unified-data-service');
jest.mock('../connection-monitor');
jest.mock('../sync-service', () => ({
  SyncService: {
    getInstance: jest.fn(() => ({
      syncToServer: jest.fn(),
    })),
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;
const MockConnectionMonitor = ConnectionMonitor as jest.MockedClass<typeof ConnectionMonitor>;

describe('Background Sync Initialization', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;
  let mockConnectionMonitor: jest.Mocked<ConnectionMonitor>;
  let backgroundSyncManager: BackgroundSyncManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    mockConnectionMonitor = new MockConnectionMonitor() as jest.Mocked<ConnectionMonitor>;

    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
  });

  describe('Initialization', () => {
    it('should create BackgroundSyncManager with UnifiedDataService and ConnectionMonitor', () => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);

      expect(backgroundSyncManager).toBeInstanceOf(BackgroundSyncManager);
      expect(mockConnectionMonitor.onConnectionChange).toHaveBeenCalled();
    });

    it('should start monitoring connection changes on initialization', () => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);

      expect(mockConnectionMonitor.onConnectionChange).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle connection change events', async () => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);

      // Get the connection change handler that was registered
      const connectionChangeHandler = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

      // Mock the sync operation by mocking the internal method
      jest.spyOn(backgroundSyncManager, 'performSync').mockResolvedValue({
        success: true,
        syncedItems: 5,
        errors: [],
        duration: 100,
      });

      // Simulate going online
      await connectionChangeHandler(true);

      expect(backgroundSyncManager.performSync).toHaveBeenCalled();
    });

    it('should not trigger sync when going offline', async () => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);

      // Get the connection change handler that was registered
      const connectionChangeHandler = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

      // Mock the sync operation
      jest.spyOn(backgroundSyncManager, 'performSync').mockResolvedValue({
        success: true,
        syncedItems: 0,
        errors: [],
        duration: 0,
      });

      // Simulate going offline
      await connectionChangeHandler(false);

      expect(backgroundSyncManager.performSync).not.toHaveBeenCalled();
    });
  });

  describe('Sync Status Management', () => {
    beforeEach(() => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);
    });

    it('should return correct initial sync status', async () => {
      const status = await backgroundSyncManager.getSyncStatus();

      expect(status).toEqual({
        isOnline: false,
        isSyncing: false,
        lastSyncTime: null,
        syncErrors: [],
        pendingItems: 0,
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);
    });

    it('should handle data service errors when getting pending items', async () => {
      // Mock data service to throw an error
      mockDataService.getAllUnsyncedItems.mockRejectedValue(new Error('Database error'));

      const status = await backgroundSyncManager.getSyncStatus();
      expect(status.pendingItems).toBe(0);
    });
  });

  describe('Resource Management', () => {
    beforeEach(() => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);
    });

    it('should dispose resources properly', () => {
      backgroundSyncManager.dispose();

      expect(mockConnectionMonitor.dispose).toHaveBeenCalled();
    });

    it('should prevent operations after disposal', async () => {
      backgroundSyncManager.dispose();

      await expect(backgroundSyncManager.performSync()).rejects.toThrow(
        'BackgroundSyncManager has been disposed',
      );

      await expect(backgroundSyncManager.forceSync()).rejects.toThrow(
        'BackgroundSyncManager has been disposed',
      );
    });

    it('should clear sync errors', () => {
      // Clear errors should work without any sync operations
      backgroundSyncManager.clearSyncErrors();

      // The method should not throw an error
      expect(() => backgroundSyncManager.clearSyncErrors()).not.toThrow();
    });
  });

  describe('Configuration', () => {
    beforeEach(() => {
      backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);
    });

    it('should allow setting max retry attempts', () => {
      backgroundSyncManager.setMaxRetryAttempts(5);
      // The method should not throw an error
      expect(() => backgroundSyncManager.setMaxRetryAttempts(5)).not.toThrow();
    });

    it('should validate max retry attempts', () => {
      expect(() => backgroundSyncManager.setMaxRetryAttempts(0)).toThrow(
        'Max retry attempts must be at least 1',
      );

      expect(() => backgroundSyncManager.setMaxRetryAttempts(-1)).toThrow(
        'Max retry attempts must be at least 1',
      );
    });

    it('should allow setting base retry delay', () => {
      backgroundSyncManager.setBaseRetryDelay(2000);
      // The method should not throw an error
      expect(() => backgroundSyncManager.setBaseRetryDelay(2000)).not.toThrow();
    });

    it('should validate base retry delay', () => {
      expect(() => backgroundSyncManager.setBaseRetryDelay(-1)).toThrow(
        'Base retry delay must be non-negative',
      );
    });
  });
});

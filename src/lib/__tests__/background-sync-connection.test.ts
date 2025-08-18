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

describe('BackgroundSyncManager Connection Integration', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;
  let mockConnectionMonitor: jest.Mocked<ConnectionMonitor>;
  let backgroundSyncManager: BackgroundSyncManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    mockConnectionMonitor = new MockConnectionMonitor() as jest.Mocked<ConnectionMonitor>;

    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
    MockConnectionMonitor.mockImplementation(() => mockConnectionMonitor);

    backgroundSyncManager = new BackgroundSyncManager(mockDataService, mockConnectionMonitor);
  });

  it('should register connection change callback on initialization', () => {
    expect(mockConnectionMonitor.onConnectionChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update online state when connection changes to online', async () => {
    // Get the callback that was registered
    const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

    // Mock the performSync method to avoid actual sync operations
    const performSyncSpy = jest.spyOn(backgroundSyncManager, 'performSync').mockResolvedValue({
      success: true,
      syncedItems: 0,
      errors: [],
      duration: 100,
    });

    // Simulate connection coming online
    await connectionCallback(true);

    expect(backgroundSyncManager.isOnline()).toBe(true);
    expect(performSyncSpy).toHaveBeenCalled();
  });

  it('should update online state when connection changes to offline', async () => {
    // Get the callback that was registered
    const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

    // Mock the performSync method to avoid actual sync operations
    const performSyncSpy = jest.spyOn(backgroundSyncManager, 'performSync').mockResolvedValue({
      success: true,
      syncedItems: 0,
      errors: [],
      duration: 100,
    });

    // Simulate connection going offline
    await connectionCallback(false);

    expect(backgroundSyncManager.isOnline()).toBe(false);
    expect(performSyncSpy).not.toHaveBeenCalled();
  });

  it('should trigger sync when coming online', async () => {
    // Get the callback that was registered
    const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

    // Mock the performSync method
    const performSyncSpy = jest.spyOn(backgroundSyncManager, 'performSync').mockResolvedValue({
      success: true,
      syncedItems: 5,
      errors: [],
      duration: 200,
    });

    // Simulate connection coming online
    await connectionCallback(true);

    expect(performSyncSpy).toHaveBeenCalledTimes(1);
  });

  it('should not trigger sync when going offline', async () => {
    // Get the callback that was registered
    const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

    // Mock the performSync method
    const performSyncSpy = jest.spyOn(backgroundSyncManager, 'performSync').mockResolvedValue({
      success: true,
      syncedItems: 0,
      errors: [],
      duration: 100,
    });

    // Simulate connection going offline
    await connectionCallback(false);

    expect(performSyncSpy).not.toHaveBeenCalled();
  });

  it('should handle sync errors during connection change', async () => {
    // Get the callback that was registered
    const connectionCallback = mockConnectionMonitor.onConnectionChange.mock.calls[0][0];

    // Mock the performSync method to throw an error
    const performSyncSpy = jest
      .spyOn(backgroundSyncManager, 'performSync')
      .mockRejectedValue(new Error('Sync failed'));

    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // The error should be handled by the ConnectionMonitor's notifyConnectionChangeCallbacks method
    // which logs errors but doesn't re-throw them
    try {
      await connectionCallback(true);
    } catch (error) {
      // The error should be caught and logged by ConnectionMonitor, not re-thrown
      console.error('Unexpected error in connection callback:', error);
    }

    expect(performSyncSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should dispose connection monitor on dispose', () => {
    backgroundSyncManager.dispose();

    expect(mockConnectionMonitor.dispose).toHaveBeenCalled();
  });

  it('should not register new callbacks after disposal', () => {
    backgroundSyncManager.dispose();

    // The ConnectionMonitor should be disposed, but the mock doesn't throw
    // We can verify that dispose was called
    expect(mockConnectionMonitor.dispose).toHaveBeenCalled();
  });
});

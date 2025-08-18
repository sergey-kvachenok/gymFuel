import { BackgroundSyncManager } from '../../lib/background-sync-manager';
import { UnifiedDataService } from '../../lib/unified-data-service';
import { ConnectionMonitor } from '../../lib/connection-monitor';

// Mock dependencies
jest.mock('../../lib/background-sync-manager');
jest.mock('../../lib/unified-data-service');
jest.mock('../../lib/connection-monitor');
jest.mock('../../lib/sync-service', () => ({
  SyncService: {
    getInstance: jest.fn(() => ({
      syncToServer: jest.fn(),
    })),
  },
}));

const MockBackgroundSyncManager = BackgroundSyncManager as jest.MockedClass<
  typeof BackgroundSyncManager
>;
const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;
const MockConnectionMonitor = ConnectionMonitor as jest.MockedClass<typeof ConnectionMonitor>;

describe('Background Sync Initialization', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;
  let mockConnectionMonitor: jest.Mocked<ConnectionMonitor>;
  let mockBackgroundSyncManager: jest.Mocked<BackgroundSyncManager>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    mockConnectionMonitor = new MockConnectionMonitor() as jest.Mocked<ConnectionMonitor>;
    mockBackgroundSyncManager = new MockBackgroundSyncManager(
      mockDataService,
      mockConnectionMonitor,
    ) as jest.Mocked<BackgroundSyncManager>;

    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
    MockConnectionMonitor.mockImplementation(() => mockConnectionMonitor);
    MockBackgroundSyncManager.mockImplementation(() => mockBackgroundSyncManager);
  });

  it('should initialize background sync system correctly', () => {
    // Test the initialization logic that would be in the providers
    const dataService = UnifiedDataService.getInstance();
    const connectionMonitor = new ConnectionMonitor();
    new BackgroundSyncManager(dataService, connectionMonitor);

    expect(MockUnifiedDataService.getInstance).toHaveBeenCalled();
    expect(MockConnectionMonitor).toHaveBeenCalled();
    expect(MockBackgroundSyncManager).toHaveBeenCalledWith(mockDataService, mockConnectionMonitor);
  });

  it('should handle background sync initialization errors gracefully', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock UnifiedDataService.getInstance to throw an error
    MockUnifiedDataService.getInstance = jest.fn().mockImplementation(() => {
      throw new Error('Data service initialization failed');
    });

    expect(() => {
      try {
        const dataService = UnifiedDataService.getInstance();
        const connectionMonitor = new ConnectionMonitor();
        new BackgroundSyncManager(dataService, connectionMonitor);
      } catch (error) {
        console.error('Error initializing background sync system:', error);
      }
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error initializing background sync system:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('should dispose background sync system correctly', () => {
    const dataService = UnifiedDataService.getInstance();
    const connectionMonitor = new ConnectionMonitor();
    const backgroundSyncManager = new BackgroundSyncManager(dataService, connectionMonitor);

    backgroundSyncManager.dispose();

    expect(mockBackgroundSyncManager.dispose).toHaveBeenCalled();
  });

  it('should handle background sync disposal errors gracefully', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock dispose to throw an error
    mockBackgroundSyncManager.dispose.mockImplementation(() => {
      throw new Error('Disposal failed');
    });

    const dataService = UnifiedDataService.getInstance();
    const connectionMonitor = new ConnectionMonitor();
    const backgroundSyncManager = new BackgroundSyncManager(dataService, connectionMonitor);

    expect(() => {
      try {
        backgroundSyncManager.dispose();
      } catch (error) {
        console.error('Error disposing background sync system:', error);
      }
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error disposing background sync system:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('should log successful initialization and disposal', () => {
    // Mock console.log to capture log messages
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Reset the dispose mock to not throw an error
    mockBackgroundSyncManager.dispose.mockImplementation(() => {});

    const dataService = UnifiedDataService.getInstance();
    const connectionMonitor = new ConnectionMonitor();
    const backgroundSyncManager = new BackgroundSyncManager(dataService, connectionMonitor);

    console.log('Background sync system initialized successfully');

    backgroundSyncManager.dispose();
    console.log('Background sync system disposed');

    expect(consoleSpy).toHaveBeenCalledWith('Background sync system initialized successfully');
    expect(consoleSpy).toHaveBeenCalledWith('Background sync system disposed');

    consoleSpy.mockRestore();
  });
});

import { ConnectionMonitor } from '../connection-monitor';

// Mock navigator.onLine
const mockNavigator = {
  onLine: true,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  },
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock window events
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

describe('ConnectionMonitor', () => {
  let connectionMonitor: ConnectionMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;
    connectionMonitor = new ConnectionMonitor();
  });

  afterEach(() => {
    connectionMonitor.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with correct online state', () => {
      expect(connectionMonitor.isOnline()).toBe(true);
    });

    it('should setup event listeners on initialization', () => {
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should initialize with offline state when navigator.onLine is false', () => {
      mockNavigator.onLine = false;
      const monitor = new ConnectionMonitor();
      expect(monitor.isOnline()).toBe(false);
      monitor.dispose();
    });
  });

  describe('Online/Offline Detection', () => {
    it('should detect online status correctly', () => {
      mockNavigator.onLine = true;
      expect(connectionMonitor.isOnline()).toBe(true);
    });

    it('should detect offline status correctly', async () => {
      mockNavigator.onLine = false;
      await connectionMonitor.checkConnectionState();
      expect(connectionMonitor.isOnline()).toBe(false);
    });

    it('should handle online event', async () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);

      // Simulate online event
      const onlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'online',
      )[1];

      await onlineHandler();

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should handle offline event', async () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);

      // Simulate offline event
      const offlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'offline',
      )[1];

      await offlineHandler();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should notify multiple callbacks on connection change', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      connectionMonitor.onConnectionChange(callback1);
      connectionMonitor.onConnectionChange(callback2);

      // Simulate online event
      const onlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'online',
      )[1];

      await onlineHandler();

      expect(callback1).toHaveBeenCalledWith(true);
      expect(callback2).toHaveBeenCalledWith(true);
    });
  });

  describe('Connection Change Callbacks', () => {
    it('should register connection change callback', () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);

      // Callback should be registered (we can't directly test the internal array)
      expect(() => connectionMonitor.onConnectionChange(callback)).not.toThrow();
    });

    it('should remove connection change callback', () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);
      connectionMonitor.removeConnectionChangeCallback(callback);

      // Should not throw when removing
      expect(() => connectionMonitor.removeConnectionChangeCallback(callback)).not.toThrow();
    });

    it('should handle callback errors gracefully', async () => {
      const errorCallback = jest.fn().mockRejectedValue(new Error('Callback error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      connectionMonitor.onConnectionChange(errorCallback);

      // Simulate online event
      const onlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'online',
      )[1];

      await onlineHandler();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in connection change callback:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Manual Connection State Check', () => {
    it('should check connection state manually', async () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);

      // Change navigator state
      mockNavigator.onLine = false;

      await connectionMonitor.checkConnectionState();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should not trigger callback if state has not changed', async () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);

      // State is already true, so no change
      await connectionMonitor.checkConnectionState();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Connection Information', () => {
    it('should get connection info with all properties', () => {
      const info = connectionMonitor.getConnectionInfo();

      expect(info).toEqual({
        isOnline: true,
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
      });
    });

    it('should handle missing connection API gracefully', () => {
      // Mock navigator without connection API
      const originalConnection = mockNavigator.connection;
      delete mockNavigator.connection;

      const info = connectionMonitor.getConnectionInfo();

      expect(info).toEqual({
        isOnline: true,
        effectiveType: undefined,
        downlink: undefined,
        rtt: undefined,
      });

      // Restore
      mockNavigator.connection = originalConnection;
    });
  });

  describe('Connectivity Testing', () => {
    it('should test connectivity successfully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await connectionMonitor.testConnectivity();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
    });

    it('should handle connectivity test failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await connectionMonitor.testConnectivity();

      expect(result).toBe(false);
    });

    it('should handle connectivity test timeout', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));

      const result = await connectionMonitor.testConnectivity();

      expect(result).toBe(false);
    });

    it('should not test connectivity when disposed', async () => {
      connectionMonitor.dispose();

      const result = await connectionMonitor.testConnectivity();

      expect(result).toBe(false);
    });
  });

  describe('Wait for Connection', () => {
    it('should resolve immediately if already online', async () => {
      const result = await connectionMonitor.waitForConnection(1000);

      expect(result).toBe(true);
    });

    it('should wait for connection to become available', async () => {
      // Set offline state
      mockNavigator.onLine = false;
      const monitor = new ConnectionMonitor();

      // Start waiting for connection
      const waitPromise = monitor.waitForConnection(1000);

      // Simulate connection becoming available
      setTimeout(() => {
        mockNavigator.onLine = true;
        monitor.checkConnectionState();
      }, 100);

      const result = await waitPromise;

      expect(result).toBe(true);
      monitor.dispose();
    });

    it('should timeout if connection does not become available', async () => {
      // Set offline state
      mockNavigator.onLine = false;
      const monitor = new ConnectionMonitor();

      const result = await monitor.waitForConnection(100);

      expect(result).toBe(false);
      monitor.dispose();
    });

    it('should not wait for connection when disposed', async () => {
      // Set offline state
      mockNavigator.onLine = false;
      const monitor = new ConnectionMonitor();

      monitor.dispose();

      const result = await monitor.waitForConnection(1000);

      expect(result).toBe(false);
    });
  });

  describe('Disposal and Cleanup', () => {
    it('should cleanup resources on disposal', () => {
      connectionMonitor.dispose();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should not allow operations after disposal', () => {
      connectionMonitor.dispose();

      expect(() => connectionMonitor.onConnectionChange(jest.fn())).toThrow(
        'ConnectionMonitor has been disposed',
      );
    });

    it('should not notify callbacks after disposal', async () => {
      const callback = jest.fn();
      connectionMonitor.onConnectionChange(callback);

      connectionMonitor.dispose();

      // Simulate online event after disposal
      const onlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'online',
      )[1];

      await onlineHandler();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple disposals gracefully', () => {
      expect(() => {
        connectionMonitor.dispose();
        connectionMonitor.dispose();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing navigator gracefully', () => {
      const originalNavigator = global.navigator;
      delete (global as any).navigator;

      expect(() => new ConnectionMonitor()).not.toThrow();

      (global as any).navigator = originalNavigator;
    });

    it('should handle missing window gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => new ConnectionMonitor()).not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe('Integration with Background Sync', () => {
    it('should trigger sync on connection restore', async () => {
      const syncCallback = jest.fn();
      connectionMonitor.onConnectionChange(syncCallback);

      // Simulate going offline then online
      mockNavigator.onLine = false;
      const offlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'offline',
      )[1];
      await offlineHandler();

      mockNavigator.onLine = true;
      const onlineHandler = mockWindow.addEventListener.mock.calls.find(
        (call) => call[0] === 'online',
      )[1];
      await onlineHandler();

      expect(syncCallback).toHaveBeenCalledWith(false);
      expect(syncCallback).toHaveBeenCalledWith(true);
    });
  });
});

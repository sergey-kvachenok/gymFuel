export type ConnectionChangeCallback = (isOnline: boolean) => void | Promise<void>;

/**
 * Connection monitor that detects online/offline status changes
 * and provides callbacks for connection state changes
 */
export class ConnectionMonitor {
  private connectionChangeCallbacks: ConnectionChangeCallback[] = [];
  private isOnlineState: boolean;
  private disposed: boolean = false;

  constructor() {
    // Safely get initial online state
    this.isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.setupEventListeners();
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.isOnlineState;
  }

  /**
   * Get current online state from navigator
   */
  private getNavigatorOnlineState(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Register a callback for connection state changes
   */
  onConnectionChange(callback: ConnectionChangeCallback): void {
    if (this.disposed) {
      throw new Error('ConnectionMonitor has been disposed');
    }

    this.connectionChangeCallbacks.push(callback);
  }

  /**
   * Remove a connection change callback
   */
  removeConnectionChangeCallback(callback: ConnectionChangeCallback): void {
    const index = this.connectionChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Setup event listeners for online/offline events
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for online event
    window.addEventListener('online', this.handleOnline.bind(this));

    // Listen for offline event
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    if (this.disposed) return;

    this.isOnlineState = true;
    await this.notifyConnectionChangeCallbacks(true);
  }

  /**
   * Handle offline event
   */
  private async handleOffline(): Promise<void> {
    if (this.disposed) return;

    this.isOnlineState = false;
    await this.notifyConnectionChangeCallbacks(false);
  }

  /**
   * Notify all registered callbacks of connection state change
   */
  private async notifyConnectionChangeCallbacks(isOnline: boolean): Promise<void> {
    const callbacks = [...this.connectionChangeCallbacks]; // Copy to avoid modification during iteration

    for (const callback of callbacks) {
      try {
        await callback(isOnline);
      } catch (error) {
        console.error('Error in connection change callback:', error);
      }
    }
  }

  /**
   * Manually trigger connection state check
   */
  async checkConnectionState(): Promise<void> {
    if (this.disposed) return;

    const newOnlineState = this.getNavigatorOnlineState();

    if (newOnlineState !== this.isOnlineState) {
      this.isOnlineState = newOnlineState;
      await this.notifyConnectionChangeCallbacks(newOnlineState);
    }
  }

  /**
   * Get connection quality information
   */
  getConnectionInfo(): {
    isOnline: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  } {
    const connection =
      typeof navigator !== 'undefined'
        ? (
            navigator as Navigator & {
              connection?: { effectiveType?: string; downlink?: number; rtt?: number };
            }
          ).connection
        : undefined;

    return {
      isOnline: this.isOnlineState,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }

  /**
   * Test network connectivity by making a lightweight request
   */
  async testConnectivity(): Promise<boolean> {
    if (this.disposed) return false;

    try {
      // Try to fetch a small resource to test connectivity
      const signal =
        typeof AbortSignal !== 'undefined' && AbortSignal.timeout
          ? AbortSignal.timeout(5000)
          : undefined;

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        ...(signal && { signal }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Wait for connection to become available
   */
  async waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
    if (this.disposed) return false;

    if (this.isOnlineState) {
      return true;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.removeConnectionChangeCallback(onConnectionChange);
        resolve(false);
      }, timeoutMs);

      const onConnectionChange = (isOnline: boolean) => {
        if (isOnline) {
          clearTimeout(timeout);
          this.removeConnectionChangeCallback(onConnectionChange);
          resolve(true);
        }
      };

      this.onConnectionChange(onConnectionChange);

      // Check if we're already online (in case the state changed between the initial check and now)
      if (this.getNavigatorOnlineState()) {
        clearTimeout(timeout);
        this.removeConnectionChangeCallback(onConnectionChange);
        resolve(true);
      }
    });
  }

  /**
   * Dispose of the connection monitor and cleanup resources
   */
  dispose(): void {
    if (this.disposed) return;

    this.disposed = true;
    this.connectionChangeCallbacks = [];

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
  }
}

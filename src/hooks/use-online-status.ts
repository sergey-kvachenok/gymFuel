import { useState, useEffect } from 'react';

/**
 * Custom hook to track the browser's online/offline status
 * Uses the navigator.onLine API and listens for online/offline events
 *
 * @returns boolean - true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  // Initialize with current online status
  const [isOnline, setIsOnline] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return navigator.onLine;
    }
    // Default to online for SSR
    return true;
  });

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => {
      console.log('Network: Back online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Network: Gone offline');
      setIsOnline(false);
    };

    // Add event listeners for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

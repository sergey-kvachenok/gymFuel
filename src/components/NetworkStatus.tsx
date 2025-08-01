import { FC, useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { syncService } from '@/lib/offline/sync';
import { offlineStorage } from '@/lib/offline/storage';
import type { AppRouter } from '@/lib/routers';
import type { TRPCClient } from '@trpc/client';

interface NetworkStatusProps {
  userId: number;
  trpcClient?: TRPCClient<AppRouter>;
}

const NetworkStatus: FC<NetworkStatusProps> = ({ userId, trpcClient }) => {
  const isOnline = useNetworkStatus();
  const [pendingOperations, setPendingOperations] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    const loadPendingOperations = async () => {
      try {
        const operations = await offlineStorage.getSyncOperations(userId);
        setPendingOperations(operations.length);
      } catch (error) {
        console.error('Failed to load pending operations:', error);
      }
    };

    loadPendingOperations();
    
    // Refresh pending operations every 30 seconds
    const interval = setInterval(loadPendingOperations, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleSync = async () => {
      if (isOnline && pendingOperations > 0 && trpcClient && !syncService.getIsSyncing()) {
        setIsSyncing(true);
        try {
          const result = await syncService.syncToServer(userId, trpcClient);
          setLastSyncResult(result);
          setPendingOperations(0);
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    // Auto-sync when coming back online
    if (isOnline && pendingOperations > 0) {
      const timer = setTimeout(handleSync, 2000); // Wait 2 seconds after coming online
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingOperations, userId, trpcClient]);

  if (!isOnline && pendingOperations === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm text-yellow-700">Offline mode</span>
      </div>
    );
  }

  if (!isOnline && pendingOperations > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-sm text-orange-700">
          Offline - {pendingOperations} changes pending sync
        </span>
      </div>
    );
  }

  if (isOnline && isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-blue-700">Syncing changes...</span>
      </div>
    );
  }

  if (isOnline && pendingOperations > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-sm text-orange-700">
          {pendingOperations} changes waiting to sync
        </span>
      </div>
    );
  }

  if (isOnline && lastSyncResult && (lastSyncResult.success > 0 || lastSyncResult.failed > 0)) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-700">
          Online - Synced {lastSyncResult.success} changes
          {lastSyncResult.failed > 0 && ` (${lastSyncResult.failed} failed)`}
        </span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-700">Online</span>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;
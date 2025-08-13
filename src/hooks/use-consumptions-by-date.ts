import { useEffect, useState, useCallback } from 'react';
import { trpc } from '../lib/trpc-client';
import { useOnlineStatus } from './use-online-status';
import { UnifiedDataService } from '../lib/unified-data-service';
import { UnifiedConsumption } from '../lib/unified-data-service';

export const useConsumptionsByDate = (userId: number | null) => {
  const [offlineConsumptions, setOfflineConsumptions] = useState<UnifiedConsumption[]>([]);
  const [isOfflineLoading, setIsOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isOnline = useOnlineStatus();
  const unifiedDataService = UnifiedDataService.getInstance();

  // Function to refresh offline data
  const refreshOfflineData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Always use tRPC when online
  const serverQuery = trpc.consumption.getByDate.useQuery(
    {},
    {
      enabled: isOnline,
      refetchOnWindowFocus: false,
    },
  );

  // Cache server data to IndexedDB when online
  useEffect(() => {
    if (isOnline && serverQuery.data) {
      // TODO: Implement server data caching to UnifiedDataService
      // unifiedDataService.batchCreateConsumptions(serverQuery.data).catch(console.error);
    }
  }, [isOnline, serverQuery.data]);

  // Fetch offline data when going offline or when refresh is triggered
  useEffect(() => {
    if (!isOnline && userId) {
      const fetchOfflineConsumptions = async () => {
        try {
          setIsOfflineLoading(true);
          setOfflineError(null);

          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);

          const offlineData = await unifiedDataService.getConsumptionsByDateRange(
            userId,
            startOfDay,
            endOfDay,
          );

          setOfflineConsumptions(offlineData);
        } catch (err) {
          setOfflineError(
            err instanceof Error ? err : new Error('Failed to fetch offline consumptions'),
          );
        } finally {
          setIsOfflineLoading(false);
        }
      };

      fetchOfflineConsumptions();
    }
  }, [isOnline, userId, refreshTrigger, unifiedDataService]);

  // Simple data source selection
  const data = isOnline ? serverQuery.data || [] : offlineConsumptions;
  const isLoading = isOnline ? serverQuery.isLoading : isOfflineLoading;
  const error = isOnline
    ? serverQuery.error
      ? new Error(serverQuery.error.message)
      : null
    : offlineError;

  return {
    data,
    isLoading,
    error,
    refreshOfflineData,
  };
};

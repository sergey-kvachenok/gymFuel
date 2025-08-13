import { useEffect, useState, useCallback } from 'react';
import { trpc } from '../lib/trpc-client';
import { useOnlineStatus } from './use-online-status';
import { offlineDataService } from '../lib/offline-data-service';
import { Consumption } from '../types/api';

export const useConsumptionsByDate = (userId: number | null) => {
  const [offlineConsumptions, setOfflineConsumptions] = useState<Consumption[]>([]);
  const [isOfflineLoading, setIsOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isOnline = useOnlineStatus();

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
      offlineDataService.cacheServerConsumptions(serverQuery.data).catch(console.error);
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

          const offlineData = await offlineDataService.getConsumptions(
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
  }, [isOnline, userId, refreshTrigger]);

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

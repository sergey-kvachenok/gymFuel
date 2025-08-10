import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc-client';
import { useOnlineStatus } from './use-online-status';
import { offlineDataService } from '../lib/offline-data-service';
import { Consumption } from '../types/api';

// Calculate daily stats from consumptions
const calculateDailyStats = (consumptions: Consumption[]) => {
  const stats = consumptions.reduce(
    (acc, consumption) => {
      const ratio = consumption.amount / 100;
      acc.totalCalories += consumption.product.calories * ratio;
      acc.totalProtein += consumption.product.protein * ratio;
      acc.totalFat += consumption.product.fat * ratio;
      acc.totalCarbs += consumption.product.carbs * ratio;
      acc.consumptionsCount += 1;
      return acc;
    },
    {
      date: new Date().toISOString().split('T')[0],
      totalCalories: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
      consumptionsCount: 0,
    },
  );

  return stats;
};

export const useDailyStats = (userId: number | null) => {
  const [offlineStats, setOfflineStats] = useState<ReturnType<typeof calculateDailyStats> | null>(
    null,
  );
  const [isOfflineLoading, setIsOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState<Error | null>(null);

  const isOnline = useOnlineStatus();

  // Always use tRPC when online - this gives us automatic invalidation
  const serverQuery = trpc.consumption.getDailyStats.useQuery(
    {},
    {
      enabled: isOnline,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch offline data when going offline
  useEffect(() => {
    if (!isOnline && userId) {
      const fetchOfflineStats = async () => {
        try {
          setIsOfflineLoading(true);
          setOfflineError(null);

          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);

          const offlineConsumptions = await offlineDataService.getConsumptions(
            userId,
            startOfDay,
            endOfDay,
          );
          const calculatedStats = calculateDailyStats(offlineConsumptions);
          setOfflineStats(calculatedStats);
        } catch (err) {
          setOfflineError(err instanceof Error ? err : new Error('Failed to fetch offline stats'));
        } finally {
          setIsOfflineLoading(false);
        }
      };

      fetchOfflineStats();
    }
  }, [isOnline, userId]);

  // Simple data source selection
  const data = isOnline ? serverQuery.data : offlineStats;
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
  };
};

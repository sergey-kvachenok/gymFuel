import { useEffect } from 'react';
import { trpc } from '@/lib/trpc-client';
import { offlineStorage } from '@/lib/offline/storage';
import { isNetworkError } from '@/lib/utils/network';
import { useOfflineBase } from './use-offline-base';

interface UseConsumptionStatsParams {
  date?: string; // For single day stats
  days?: number; // For history (last N days)
}

export const useConsumptionStats = (params: UseConsumptionStatsParams = {}) => {
  const {
    isOnline,
    wasOfflineRef,
    userId,
    offlineData: offlineStats,
    setOfflineData: setOfflineStats,
    isLoadingOffline,
    setIsLoadingOffline,
    tRPCEnabled,
  } = useOfflineBase<Record<string, unknown> | Record<string, unknown>[] | null>(null);

  const isHistoryMode = !!params.days;

  // Choose the appropriate tRPC query based on mode
  const dailyStatsQuery = trpc.consumption.getDailyStats.useQuery(
    { date: params.date },
    {
      enabled: !isHistoryMode && tRPCEnabled,
      retry: (failureCount, error) => {
        return failureCount < 1 && !isNetworkError(error);
      },
    },
  );

  const historyQuery = trpc.consumption.getHistory.useQuery(
    { days: params.days || 30 },
    {
      enabled: isHistoryMode && tRPCEnabled,
      retry: (failureCount, error) => {
        return failureCount < 1 && !isNetworkError(error);
      },
    },
  );

  // Use the appropriate query based on mode
  const activeQuery = isHistoryMode ? historyQuery : dailyStatsQuery;

  // Load offline data when offline
  useEffect(() => {
    const loadOfflineStats = async () => {
      if (!isOnline && userId > 0) {
        setIsLoadingOffline(true);

        try {
          if (isHistoryMode) {
            // Generate offline history from last X days
            const days = params.days || 30;
            const historyData = [];

            console.log(`🔍 Generating offline history for ${days} days`);

            for (let i = 0; i < days; i++) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dateStr = date.toISOString().split('T')[0];

              try {
                const stats = await offlineStorage.getDailyStats(userId, dateStr);
                console.log(
                  `📅 ${dateStr}: ${stats.consumptionsCount} consumptions, ${stats.totalCalories} calories`,
                );

                if (stats.consumptionsCount > 0) {
                  historyData.push(stats);
                }
              } catch (err) {
                console.warn(`Failed to get stats for ${dateStr}:`, err);
              }
            }

            console.log(`📊 Total history days with data: ${historyData.length}`);
            setOfflineStats(historyData);
          } else {
            // Single day stats
            const stats = await offlineStorage.getDailyStats(userId, params.date);
            setOfflineStats(stats);
          }
        } catch (error) {
          console.error('Failed to load offline stats:', error);
          setOfflineStats(isHistoryMode ? [] : null);
        } finally {
          setIsLoadingOffline(false);
        }
      }
    };

    loadOfflineStats();
  }, [isOnline, userId, params.date, params.days, isHistoryMode, setIsLoadingOffline, setOfflineStats]);

  // Track offline state and invalidate when back online
  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      console.log('📡 Back online - invalidating tRPC cache');
      activeQuery.refetch();
      wasOfflineRef.current = false;
    } else if (!isOnline) {
      wasOfflineRef.current = true;
    }
  }, [isOnline, activeQuery, wasOfflineRef]);

  return {
    data: isOnline ? activeQuery.data : offlineStats,
    isLoading: isOnline ? activeQuery.isLoading : isLoadingOffline,
    error: isOnline ? activeQuery.error : null,
    refetch: activeQuery.refetch,
    isPending: false,
    isOnline,
    dataSource: isOnline ? 'trpc' : 'indexeddb',
    isHistoryMode,
  };
};

import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc-client';
import { useOnlineStatus } from './use-online-status';
import { UnifiedDataService } from '../lib/unified-data-service';
import { UnifiedNutritionGoals } from '../lib/unified-data-service';

export const useNutritionGoals = (userId: number | null) => {
  const [offlineGoals, setOfflineGoals] = useState<UnifiedNutritionGoals | null>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState<Error | null>(null);

  const isOnline = useOnlineStatus();
  const unifiedDataService = UnifiedDataService.getInstance();

  // Always use tRPC when online
  const serverQuery = trpc.goals.get.useQuery(undefined, {
    enabled: isOnline,
    refetchOnWindowFocus: false,
  });

  // Cache server data to IndexedDB when online
  useEffect(() => {
    if (isOnline && serverQuery.data) {
      // TODO: Implement server data caching to UnifiedDataService
      // unifiedDataService.createNutritionGoals(serverQuery.data).catch(console.error);
    }
  }, [isOnline, serverQuery.data]);

  // Fetch offline data when going offline
  useEffect(() => {
    if (!isOnline && userId) {
      const fetchOfflineGoals = async () => {
        try {
          setIsOfflineLoading(true);
          setOfflineError(null);

          const offlineData = await unifiedDataService.getNutritionGoals(userId);
          setOfflineGoals(offlineData || null);
        } catch (err) {
          setOfflineError(
            err instanceof Error ? err : new Error('Failed to fetch offline nutrition goals'),
          );
        } finally {
          setIsOfflineLoading(false);
        }
      };

      fetchOfflineGoals();
    }
  }, [isOnline, userId, unifiedDataService]);

  // Simple data source selection
  const data = isOnline ? serverQuery.data : offlineGoals;
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

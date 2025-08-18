import { useEffect, useState, useCallback } from 'react';
import { UnifiedDataService } from '../lib/unified-data-service';
import { UnifiedConsumption } from '../lib/unified-data-service';

export const useConsumptionsByDate = (userId: number | null) => {
  const [data, setData] = useState<UnifiedConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const unifiedDataService = UnifiedDataService.getInstance();

  // Function to refresh data
  const refreshOfflineData = useCallback(() => {
    console.log('🔄 refreshOfflineData called, triggering re-fetch...');
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchConsumptions = async () => {
      if (!userId) {
        setData([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const consumptions = await unifiedDataService.getConsumptionsByDateRange(
          userId,
          startOfDay,
          endOfDay,
        );

        console.log(
          '📊 useConsumptionsByDate: Fetched consumptions:',
          consumptions.length,
          'items',
        );
        setData(consumptions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch consumptions'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsumptions();
  }, [userId, refreshTrigger, unifiedDataService]);

  return {
    data,
    isLoading,
    error,
    refreshOfflineData,
  };
};

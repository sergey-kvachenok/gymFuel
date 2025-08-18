import { useEffect, useState } from 'react';
import { UnifiedDataService } from '../lib/unified-data-service';
import { UnifiedNutritionGoals } from '../lib/unified-data-service';

export const useNutritionGoals = (userId: number | null) => {
  const [data, setData] = useState<UnifiedNutritionGoals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unifiedDataService = UnifiedDataService.getInstance();

  useEffect(() => {
    const fetchNutritionGoals = async () => {
      if (!userId) {
        setData(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const goals = await unifiedDataService.getNutritionGoals(userId);
        setData(goals || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch nutrition goals'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNutritionGoals();
  }, [userId, unifiedDataService]);

  return {
    data,
    isLoading,
    error,
  };
};

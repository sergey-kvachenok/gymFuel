'use client';
import { useCallback } from 'react';

// Simple utility hook for invalidating/refetching data
// This replaces the complex useOfflineTRPC utils pattern
export const useOfflineUtils = () => {
  // For now, this is a placeholder that could trigger global state updates
  // or component re-renders when mutations complete
  const invalidateProducts = useCallback(() => {
    // In a full implementation, this would trigger a global state update
    // or emit an event that causes components using useOfflineProducts to refetch
    console.log('Products invalidated - components should refetch');
    
    // For now, we rely on the mutation success callbacks to handle refetching
    // A more sophisticated solution would use a global state manager or event system
  }, []);

  const invalidateConsumption = useCallback(() => {
    console.log('Consumption invalidated - components should refetch');
  }, []);

  const invalidateGoals = useCallback(() => {
    console.log('Goals invalidated - components should refetch');
  }, []);

  return {
    product: {
      getAll: {
        invalidate: invalidateProducts,
      },
    },
    consumption: {
      getAll: {
        invalidate: invalidateConsumption,
      },
    },
    goal: {
      getAll: {
        invalidate: invalidateGoals,
      },
    },
  };
};
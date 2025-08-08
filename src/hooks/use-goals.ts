'use client';
import { useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { trpcClient } from '@/lib/trpc-client';
import { offlineStorage } from '@/lib/offline/storage';
import { isNetworkError } from '@/lib/utils/network';
import type { IFormData, GoalType } from '@/app/(protected)/goals/types';
import type { OfflineGoal } from '@/lib/db/indexeddb';
import { useOfflineBase } from './use-offline-base';

export const useGoals = () => {
  const {
    isOnline,
    wasOfflineRef,
    userId,
    offlineData: offlineGoals,
    setOfflineData: setOfflineGoals,
    isLoadingOffline,
    setIsLoadingOffline,
    checkAuth,
    tRPCEnabled,
  } = useOfflineBase<OfflineGoal | null>(null);

  // Standard tRPC query - only enabled when online
  const trpcQuery = trpc.goals.get.useQuery(undefined, {
    enabled: tRPCEnabled,
    retry: (failureCount, error) => {
      // Don't retry network errors since we'll use offline fallback
      return failureCount < 1 && !isNetworkError(error);
    },
  });

  // Cache successful online data to IndexedDB
  useEffect(() => {
    const cacheGoalsToIndexedDB = async () => {
      if (trpcQuery.data && isOnline && userId > 0) {
        try {
          // Check if goal already exists offline
          const existingGoals = await offlineStorage.getGoals(userId);
          const existing = existingGoals.find((g) => g.id === trpcQuery.data!.id);

          if (existing) {
            // Update existing goal
            await offlineStorage.updateGoal(userId, existing.id!, {
              dailyCalories: trpcQuery.data.dailyCalories,
              dailyProtein: trpcQuery.data.dailyProtein,
              dailyFat: trpcQuery.data.dailyFat,
              dailyCarbs: trpcQuery.data.dailyCarbs,
              goalType: trpcQuery.data.goalType as GoalType,
            });
          }
          // If goal doesn't exist offline, it will be created when needed
        } catch (error) {
          console.warn('Failed to cache goals to IndexedDB:', error);
        }
      }
    };

    cacheGoalsToIndexedDB();
  }, [trpcQuery.data, isOnline, userId]);

  // Load offline data when offline
  useEffect(() => {
    const loadOfflineGoals = async () => {
      if (!isOnline && userId > 0) {
        setIsLoadingOffline(true);

        try {
          const goals = await offlineStorage.getGoals(userId);
          // Use the latest goal if multiple exist
          const latestGoal = goals.length > 0 ? goals[goals.length - 1] : null;
          setOfflineGoals(latestGoal);
        } catch (error) {
          console.error('Failed to load offline goals:', error);
          setOfflineGoals(null);
        } finally {
          setIsLoadingOffline(false);
        }
      }
    };

    loadOfflineGoals();
  }, [isOnline, userId, setIsLoadingOffline, setOfflineGoals]);

  // Track offline state and invalidate when back online
  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      console.log('📡 Back online - invalidating tRPC cache');
      trpcQuery.refetch();
      wasOfflineRef.current = false;
    } else if (!isOnline) {
      wasOfflineRef.current = true;
    }
  }, [isOnline, trpcQuery, wasOfflineRef]);

  // Enhanced mutation function with offline fallback
  const upsertGoal = useMemo(
    () => async (data: IFormData) => {
      checkAuth();

      try {
        if (isOnline) {
          try {
            // Try online first
            const result = await trpcClient.goals.upsert.mutate(data);

            // Cache to IndexedDB for offline access
            try {
              const existingGoals = await offlineStorage.getGoals(userId);
              const existing = existingGoals.find((g) => g.id === result.id);

              if (existing) {
                await offlineStorage.updateGoal(userId, existing.id!, data);
              } else {
                await offlineStorage.createGoal(userId, data);
              }
            } catch (cacheError) {
              console.warn('Failed to cache updated goal:', cacheError);
            }

            // Only refetch when online
            trpcQuery.refetch();
            return result;
          } catch (onlineError) {
            if (isNetworkError(onlineError)) {
              console.warn('Online upsert failed, using offline:', onlineError);
              // Fallback to offline
              const existingGoals = await offlineStorage.getGoals(userId);
              if (existingGoals.length > 0) {
                const latestGoal = existingGoals[existingGoals.length - 1];
                const result = await offlineStorage.updateGoal(userId, latestGoal.id!, data);
                return result;
              } else {
                const result = await offlineStorage.createGoal(userId, data);
                return result;
              }
            }
            throw onlineError;
          }
        } else {
          // Use offline storage when offline
          const existingGoals = await offlineStorage.getGoals(userId);
          if (existingGoals.length > 0) {
            const latestGoal = existingGoals[existingGoals.length - 1];
            const result = await offlineStorage.updateGoal(userId, latestGoal.id!, data);
            return result;
          } else {
            const result = await offlineStorage.createGoal(userId, data);
            return result;
          }
        }
      } catch (error) {
        throw error;
      }
    },
    [checkAuth, isOnline, trpcQuery, userId],
  );

  return {
    data: isOnline ? trpcQuery.data : offlineGoals,
    isLoading: isOnline ? trpcQuery.isLoading : isLoadingOffline,
    error: isOnline ? trpcQuery.error : null,

    upsertGoal,
    refetch: trpcQuery.refetch,

    isPending: false,
    isOnline,
    dataSource: isOnline ? 'trpc' : 'indexeddb',
  };
};

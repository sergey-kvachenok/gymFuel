import { useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { trpcClient } from '@/lib/trpc-client';
import { offlineStorage } from '@/lib/offline/storage';
import { isNetworkError } from '@/lib/utils/network';
import { useOfflineBase } from './use-offline-base';
import {
  CreateConsumptionInput,
  UpdateConsumptionInput,
  DeleteConsumptionInput,
} from '@/types/api';
import type { OfflineConsumption } from '@/lib/db/indexeddb';

interface UseOfflineConsumptionParams {
  date?: string;
}

export const useConsumption = (params: UseOfflineConsumptionParams = {}) => {
  const {
    isOnline,
    wasOfflineRef,
    userId,
    offlineData: offlineConsumption,
    setOfflineData: setOfflineConsumption,
    isLoadingOffline,
    setIsLoadingOffline,
    checkAuth,
    tRPCEnabled,
  } = useOfflineBase<OfflineConsumption[]>([]);

  // Standard tRPC query - only enabled when online
  const trpcQuery = trpc.consumption.getByDate.useQuery(params, {
    enabled: tRPCEnabled,
    retry: (failureCount, error) => {
      // Don't retry network errors since we'll use offline fallback
      return failureCount < 1 && !isNetworkError(error);
    },
  });

  // Cache successful online data to IndexedDB
  useEffect(() => {
    const cacheConsumptionToIndexedDB = async () => {
      if (trpcQuery.data && isOnline && userId > 0) {
        const offlineData: OfflineConsumption[] = trpcQuery.data.map((product) => ({
          ...product,
          updatedAt: product.createdAt,
          synced: true,
        }));

        try {
          await offlineStorage.syncConsumption(userId, offlineData);
        } catch (error) {
          console.warn('Failed to cache consumption to IndexedDB:', error);
        }
      }
    };

    cacheConsumptionToIndexedDB();
  }, [trpcQuery.data, isOnline, userId]);

  // Load offline data when offline
  useEffect(() => {
    const loadOfflineConsumption = async () => {
      if (!isOnline && userId > 0) {
        setIsLoadingOffline(true);

        try {
          const consumption = await offlineStorage.getConsumption(userId);

          setOfflineConsumption(consumption);
        } catch (error) {
          console.error('Failed to load offline products:', error);
          setOfflineConsumption([]);
        } finally {
          setIsLoadingOffline(false);
        }
      }
    };

    loadOfflineConsumption();
  }, [isOnline, userId]);

  // Track offline state and invalidate when back online
  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      console.log('📡 Back online - invalidating tRPC cache');
      trpcQuery.refetch();
      wasOfflineRef.current = false;
    } else if (!isOnline) {
      wasOfflineRef.current = true;
    }
  }, [isOnline, trpcQuery]);

  // Enhanced mutation functions with offline fallback
  const createConsumption = useMemo(
    () => async (data: CreateConsumptionInput) => {
      checkAuth();

      try {
        if (isOnline) {
          try {
            // Try online first
            const result = await trpcClient.consumption.create.mutate(data);

            // Cache to IndexedDB for offline access
            const offlineConsumption: OfflineConsumption = {
              ...result,
              updatedAt: result.createdAt,
              synced: true,
            };

            try {
              await offlineStorage.syncConsumption(userId, [offlineConsumption]);
            } catch (cacheError) {
              console.warn('Failed to cache created product:', cacheError);
            }

            // Only refetch when online
            trpcQuery.refetch();
            return result;
          } catch (onlineError) {
            if (isNetworkError(onlineError)) {
              console.warn('Online create failed, using offline:', onlineError);
              // Fallback to offline
              const result = await offlineStorage.createConsumption(userId, data);
              // When offline, tRPC query will get updated data via IndexedDB fallback automatically
              return result;
            }
            throw onlineError;
          }
        } else {
          // Use offline storage when offline
          const result = await offlineStorage.createConsumption(userId, data);
          // No refetch needed - tRPC query will get updated data via IndexedDB fallback
          return result;
        }
      } catch (error) {
        throw error;
      }
    },
    [checkAuth, isOnline, trpcQuery, userId],
  );

  const updateConsumption = useMemo(
    () => async (data: UpdateConsumptionInput) => {
      checkAuth();

      try {
        if (isOnline) {
          try {
            // Try online first
            const result = await trpcClient.consumption.update.mutate(data);

            // Update cache in IndexedDB
            const offlineConsumption: OfflineConsumption = {
              ...result,
              updatedAt: result.createdAt,
              synced: true,
            };

            try {
              await offlineStorage.syncConsumption(userId, [offlineConsumption]);
            } catch (cacheError) {
              console.warn('Failed to cache updated product:', cacheError);
            }

            // Only refetch when online
            trpcQuery.refetch();
            return result;
          } catch (onlineError) {
            if (isNetworkError(onlineError)) {
              console.warn('Online update failed, using offline:', onlineError);
              // Fallback to offline
              const result = await offlineStorage.updateConsumption(userId, data);
              return result;
            }
            throw onlineError;
          }
        } else {
          // Use offline storage when offline
          const result = await offlineStorage.updateConsumption(userId, data);
          return result;
        }
      } catch (error) {
        throw error;
      }
    },
    [checkAuth, isOnline, trpcQuery, userId],
  );

  const deleteConsumption = useMemo(
    () => async (data: DeleteConsumptionInput) => {
      checkAuth();

      try {
        if (isOnline) {
          try {
            // Try online first
            await trpcClient.consumption.delete.mutate(data);

            // Remove from cache
            try {
              await offlineStorage.deleteConsumption(userId, data.id);
            } catch (cacheError) {
              console.warn('Failed to remove deleted consumption from cache:', cacheError);
            }

            // Only refetch when online
            trpcQuery.refetch();
          } catch (onlineError) {
            if (isNetworkError(onlineError)) {
              console.warn('Online delete failed, using offline:', onlineError);
              // Fallback to offline
              await offlineStorage.deleteConsumption(userId, data.id);
            } else {
              throw onlineError;
            }
          }
        } else {
          // Use offline storage when offline
          await offlineStorage.deleteConsumption(userId, data.id);
        }
      } catch (error) {
        throw error;
      }
    },
    [checkAuth, isOnline, trpcQuery, userId],
  );

  return {
    consumption: isOnline ? trpcQuery.data || [] : offlineConsumption,
    isLoading: isOnline ? trpcQuery.isLoading : isLoadingOffline,
    error: isOnline ? trpcQuery.error : null,

    createConsumption,
    updateConsumption,
    deleteConsumption,
    refetch: trpcQuery.refetch,

    isPending: false,
    isOnline,
    dataSource: isOnline ? 'trpc' : 'indexeddb',
  };
};

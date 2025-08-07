'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { trpc } from '@/lib/trpc-client';
import { trpcClient } from '@/lib/trpc-client';
import { offlineStorage } from '@/lib/offline/storage';
import { useNetworkStatus } from './use-network-status';
import { getUserIdWithFallback, cacheUserId } from '@/lib/utils/auth';
import { isNetworkError } from '@/lib/utils/network';
import {
  ProductSearchOptions,
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
} from '@/types/api';
import type { OfflineProduct } from '@/lib/db/indexeddb';

interface UseProductsProps {
  searchOptions?: ProductSearchOptions;
}

export const useProducts = (props?: UseProductsProps) => {
  const { data: session, status } = useSession();
  const { searchOptions } = props || {};
  const isOnline = useNetworkStatus();
  const wasOfflineRef = useRef(false);

  const userId = getUserIdWithFallback(session, isOnline);
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([]);
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);

  // Cache userId for offline use
  useEffect(() => {
    cacheUserId(session);
  }, [session]);

  // Memoize searchOptions to prevent infinite loops
  const memoizedSearchOptions = useMemo(() => searchOptions, [searchOptions]);

  // Standard tRPC query - only enabled when online
  const trpcQuery = trpc.product.getAll.useQuery(memoizedSearchOptions, {
    enabled:
      isOnline &&
      (!!session?.user ||
        (typeof window !== 'undefined' && !!localStorage.getItem('cachedUserId'))),
    retry: (failureCount, error) => {
      // Don't retry network errors since we'll use offline fallback
      return failureCount < 1 && !isNetworkError(error);
    },
  });

  // Cache successful online data to IndexedDB
  useEffect(() => {
    const cacheProductsToIndexedDB = async () => {
      if (trpcQuery.data && isOnline && userId > 0) {
        const offlineData: OfflineProduct[] = trpcQuery.data.map((product) => ({
          ...product,
          updatedAt: product.createdAt,
          synced: true,
        }));

        try {
          await offlineStorage.syncProducts(userId, offlineData);
        } catch (error) {
          console.warn('Failed to cache products to IndexedDB:', error);
        }
      }
    };

    cacheProductsToIndexedDB();
  }, [trpcQuery.data, isOnline, userId]);

  // Load offline data when offline
  useEffect(() => {
    const loadOfflineProducts = async () => {
      if (!isOnline && userId > 0) {
        setIsLoadingOffline(true);

        try {
          const products = await offlineStorage.getProducts(userId);

          // Apply client-side filtering for offline data
          let filteredData = [...products];

          if (memoizedSearchOptions?.query) {
            filteredData = filteredData.filter((product) =>
              product.name.toLowerCase().includes(memoizedSearchOptions.query!.toLowerCase()),
            );
          }

          if (memoizedSearchOptions?.orderBy === 'name') {
            filteredData.sort((a, b) => {
              const direction = memoizedSearchOptions.orderDirection === 'desc' ? -1 : 1;
              return a.name.localeCompare(b.name) * direction;
            });
          }

          setOfflineProducts(filteredData);
        } catch (error) {
          console.error('Failed to load offline products:', error);
          setOfflineProducts([]);
        } finally {
          setIsLoadingOffline(false);
        }
      }
    };

    loadOfflineProducts();
  }, [isOnline, userId, memoizedSearchOptions]);

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
  const createProduct = useMemo(
    () => async (data: CreateProductInput) => {
      if (status === 'loading' || (userId <= 0 && isOnline)) {
        throw new Error('User not authenticated');
      }

      try {
        if (isOnline) {
          try {
            // Try online first
            const result = await trpcClient.product.create.mutate(data);

            // Cache to IndexedDB for offline access
            const offlineProduct: OfflineProduct = {
              ...result,
              updatedAt: result.createdAt,
              synced: true,
            };

            try {
              await offlineStorage.syncProducts(userId, [offlineProduct]);
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
              const result = await offlineStorage.createProduct(userId, data);
              // When offline, tRPC query will get updated data via IndexedDB fallback automatically
              return result;
            }
            throw onlineError;
          }
        } else {
          // Use offline storage when offline
          const result = await offlineStorage.createProduct(userId, data);
          // No refetch needed - tRPC query will get updated data via IndexedDB fallback
          return result;
        }
      } catch (error) {
        throw error;
      }
    },
    [isOnline, status, userId],
  );

  const updateProduct = useMemo(
    () => async (data: UpdateProductInput) => {
      if (status === 'loading' || (userId <= 0 && isOnline)) {
        throw new Error('User not authenticated');
      }

      try {
        if (isOnline) {
          try {
            // Try online first
            const result = await trpcClient.product.update.mutate(data);

            // Update cache in IndexedDB
            const offlineProduct: OfflineProduct = {
              ...result,
              updatedAt: result.createdAt,
              synced: true,
            };

            try {
              await offlineStorage.syncProducts(userId, [offlineProduct]);
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
              const result = await offlineStorage.updateProduct(userId, data);
              return result;
            }
            throw onlineError;
          }
        } else {
          // Use offline storage when offline
          const result = await offlineStorage.updateProduct(userId, data);
          return result;
        }
      } catch (error) {
        throw error;
      }
    },
    [isOnline, status, userId],
  );

  const deleteProduct = useMemo(
    () => async (data: DeleteProductInput) => {
      if (status === 'loading' || (userId <= 0 && isOnline)) {
        throw new Error('User not authenticated');
      }

      try {
        if (isOnline) {
          try {
            // Try online first
            await trpcClient.product.delete.mutate(data);

            // Remove from cache
            try {
              await offlineStorage.deleteProduct(userId, data.id);
            } catch (cacheError) {
              console.warn('Failed to remove deleted product from cache:', cacheError);
            }

            // Only refetch when online
            trpcQuery.refetch();
          } catch (onlineError) {
            if (isNetworkError(onlineError)) {
              console.warn('Online delete failed, using offline:', onlineError);
              // Fallback to offline
              await offlineStorage.deleteProduct(userId, data.id);
            } else {
              throw onlineError;
            }
          }
        } else {
          // Use offline storage when offline
          await offlineStorage.deleteProduct(userId, data.id);
        }
      } catch (error) {
        throw error;
      }
    },
    [isOnline, status, userId],
  );

  return {
    // Data - use online data when online, offline data when offline
    products: isOnline ? trpcQuery.data || [] : offlineProducts,
    isLoading: isOnline ? trpcQuery.isLoading : isLoadingOffline,
    error: isOnline ? trpcQuery.error : null,

    // Actions
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: trpcQuery.refetch,

    // States
    isPending: false, // Could be enhanced with useState if needed

    // Debug info
    isOnline,
    dataSource: isOnline ? 'trpc' : 'indexeddb',
  };
};

'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import type { OfflineProduct } from '@/lib/db/indexeddb';

export const useOfflineProducts = (params?: {
  query?: string;
  limit?: number;
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();

  // Fallback for offline: try to get cached userId from localStorage
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
      console.log('Using cached userId for offline:', userId);
    }
  } else if (userId > 0 && isOnline) {
    // Cache userId when online for offline use
    localStorage.setItem('cachedUserId', userId.toString());
  }

  const [data, setData] = useState<OfflineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('useOfflineProducts effect:', { status, userId, isOnline, session });

    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    // Only fail authentication if we're online AND don't have cached userId
    if (status === 'unauthenticated' && isOnline && userId === 0) {
      setIsLoading(false);
      setError(new Error('User not authenticated'));
      return;
    }

    // When offline or online with cached userId, don't fail on unauthenticated status if we have cached userId
    if (status === 'unauthenticated' && userId === 0) {
      setIsLoading(false);
      setError(new Error('No cached user data available'));
      return;
    }

    if (userId > 0) {
      setIsLoading(true);

      if (isOnline) {
        // Use regular tRPC when online
        trpcClient.product.getAll
          .query(params)
          .then(async (result) => {
            // Transform API products to OfflineProduct format
            const offlineProducts: OfflineProduct[] = result.map((product) => ({
              ...product,
              updatedAt: product.createdAt,
              synced: true,
            }));

            // Cache the data to IndexedDB for offline access
            try {
              console.log('Caching', offlineProducts.length, 'products to IndexedDB');
              await offlineStorage.syncProducts(userId, offlineProducts);
              console.log('Successfully cached products to IndexedDB');
            } catch (cacheError) {
              console.warn('Failed to cache products to IndexedDB:', cacheError);
            }

            setData(offlineProducts);
            setError(null);
          })
          .catch(async (err) => {
            console.warn('Online products query failed, using cached data:', err);
            try {
              // Always fallback to offline data
              const offlineResult = await offlineStorage.getProducts(userId);
              // Apply client-side filtering for offline data
              let filteredData = offlineResult;
              if (params?.query) {
                filteredData = filteredData.filter((product: OfflineProduct) =>
                  product.name.toLowerCase().includes(params.query!.toLowerCase()),
                );
              }
              // Apply client-side sorting
              if (params?.orderBy === 'name') {
                filteredData.sort((a: OfflineProduct, b: OfflineProduct) => {
                  const direction = params?.orderDirection === 'desc' ? -1 : 1;
                  return a.name.localeCompare(b.name) * direction;
                });
              }
              console.log('Using cached products as fallback:', filteredData.length, 'items');
              setData(filteredData);
              setError(null); // Clear error since we have fallback data
            } catch (offlineErr) {
              console.error('Both online and offline products fetch failed:', offlineErr);
              setError(offlineErr as Error);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Use offline storage when offline
        console.log('App is offline, loading products from IndexedDB for userId:', userId);
        offlineStorage
          .getProducts(userId)
          .then((result) => {
            console.log('Loaded', result.length, 'products from IndexedDB:', result);
            let filteredData = result;
            // Apply client-side filtering for offline data
            if (params?.query) {
              filteredData = filteredData.filter((product: OfflineProduct) =>
                product.name.toLowerCase().includes(params.query!.toLowerCase()),
              );
            }
            // Apply client-side sorting
            if (params?.orderBy === 'name') {
              filteredData.sort((a: OfflineProduct, b: OfflineProduct) => {
                const direction = params?.orderDirection === 'desc' ? -1 : 1;
                return a.name.localeCompare(b.name) * direction;
              });
            }
            setData(filteredData);
            setError(null);
          })
          .catch((err) => {
            console.error('Error loading products from IndexedDB:', err);
            setError(err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      console.log('No valid userId, setting empty data');
      setIsLoading(false);
      setData([]);
      setError(new Error('No valid user ID'));
    }
  }, [userId, isOnline, status, params, session]);

  return { data, isLoading, error };
};
('use client');
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import type { OfflineProduct } from '@/lib/db/indexeddb';
import { ProductSearchOptions } from '@/types/api';

export const useOfflineProducts = (params?: ProductSearchOptions) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();

  // Fallback for offline: try to get cached userId from localStorage
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
      console.log('Using cached userId for offline:', userId);
    }
  } else if (userId > 0 && isOnline) {
    // Cache userId when online for offline use
    localStorage.setItem('cachedUserId', userId.toString());
  }

  const [data, setData] = useState<OfflineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getOnlineProducts = useCallback(
    async (params?: ProductSearchOptions) => {
      try {
        const result = await trpcClient.product.getAll.query(params);

        const offlineProducts: OfflineProduct[] = result.map((product) => ({
          ...product,
          updatedAt: product.createdAt,
          synced: true,
        }));

        // Cache the data to IndexedDB for offline access
        try {
          await offlineStorage.syncProducts(userId, offlineProducts);
        } catch (cacheError) {
          console.warn('Failed to cache products to IndexedDB:', cacheError);
        }

        setData(offlineProducts);
        setError(null);
        return offlineProducts;
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const getOfflineProducts = useCallback(
    async (params?: ProductSearchOptions) => {
      try {
        const products = await offlineStorage.getProducts(userId);
        let filteredData = [...products];

        // Apply client-side filtering for offline data
        if (params?.query) {
          filteredData = filteredData.filter((product: OfflineProduct) =>
            product.name.toLowerCase().includes(params.query!.toLowerCase()),
          );
        }

        if (params?.orderBy === 'name') {
          filteredData.sort((a: OfflineProduct, b: OfflineProduct) => {
            const direction = params?.orderDirection === 'desc' ? -1 : 1;
            return a.name.localeCompare(b.name) * direction;
          });
        }

        setData(filteredData);
        setError(null);

        return filteredData;
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    // Only fail authentication if we're online AND don't have cached userId
    if (status === 'unauthenticated' && isOnline && userId === 0) {
      setIsLoading(false);
      setError(new Error('User not authenticated'));
      return;
    }

    // When offline or online with cached userId, don't fail on unauthenticated status if we have cached userId
    if (status === 'unauthenticated' && userId === 0) {
      setIsLoading(false);
      setError(new Error('No cached user data available'));
      return;
    }

    if (userId > 0) {
      setIsLoading(true);

      if (isOnline) {
        getOnlineProducts(params);
      } else {
        getOfflineProducts(params);
      }
    } else {
      setIsLoading(false);
      setData([]);
      setError(new Error('No valid user ID'));
    }
  }, [getOnlineProducts, getOfflineProducts, status, userId, isOnline, session, params]);

  return {
    data,
    isLoading,
    error,
    invalidateOnline: getOnlineProducts,
    getOnlineProducts,
    getOfflineProducts,
  };
};

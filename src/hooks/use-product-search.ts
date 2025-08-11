import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc-client';
import { useOnlineStatus } from './use-online-status';
import { offlineDataService } from '../lib/offline-data-service';

interface ProductSearchOptions {
  query?: string;
  limit?: number;
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export const useProductSearch = (userId: number | null, options: ProductSearchOptions = {}) => {
  const {
    query: initialQuery = '',
    limit = 100,
    orderBy = 'createdAt',
    orderDirection = 'desc',
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [offlineProducts, setOfflineProducts] = useState<any[]>([]);
  const [isOfflineLoading, setIsOfflineLoading] = useState(false);
  const [offlineError, setOfflineError] = useState<Error | null>(null);

  const isOnline = useOnlineStatus();

  // Always use tRPC when online
  const serverQuery = trpc.product.getAll.useQuery(
    {
      query: searchQuery,
      limit,
      orderBy,
      orderDirection,
    },
    {
      enabled: isOnline,
      refetchOnWindowFocus: false,
    },
  );

  // Cache server data to IndexedDB when online
  useEffect(() => {
    if (isOnline && serverQuery.data) {
      offlineDataService.cacheServerProducts(serverQuery.data).catch(console.error);
    }
  }, [isOnline, serverQuery.data]);

  // Fetch offline data when going offline
  useEffect(() => {
    if (!isOnline && userId && typeof userId === 'number') {
      const fetchOfflineProducts = async () => {
        try {
          setIsOfflineLoading(true);
          setOfflineError(null);

          const offlineData = await offlineDataService.getProducts(userId);

          // Apply search filter if query is provided
          let filteredProducts = offlineData;
          if (searchQuery.trim()) {
            filteredProducts = offlineData.filter((product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
          }

          // Apply sorting
          filteredProducts.sort((a, b) => {
            if (orderBy === 'name') {
              return orderDirection === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            } else {
              return orderDirection === 'asc'
                ? a.createdAt.getTime() - b.createdAt.getTime()
                : b.createdAt.getTime() - a.createdAt.getTime();
            }
          });

          // Apply limit
          if (limit) {
            filteredProducts = filteredProducts.slice(0, limit);
          }

          setOfflineProducts(filteredProducts);
        } catch (err) {
          setOfflineError(
            err instanceof Error ? err : new Error('Failed to fetch offline products'),
          );
        } finally {
          setIsOfflineLoading(false);
        }
      };

      fetchOfflineProducts();
    }
  }, [isOnline, userId, searchQuery, orderBy, orderDirection, limit]); // Include all dependencies

  // Simple data source selection
  const products = isOnline ? serverQuery.data || [] : offlineProducts;
  const isLoading = isOnline ? serverQuery.isLoading : isOfflineLoading;
  const error = isOnline
    ? serverQuery.error
      ? new Error(serverQuery.error.message)
      : null
    : offlineError;

  return {
    searchQuery,
    setSearchQuery,
    products,
    allProducts: products,
    isLoading,
    error,
  };
};

import { useState, useCallback, useMemo } from 'react';
import { useOfflineProducts } from './use-offline-products';

interface ProductSearchOptions {
  query?: string;
  limit?: number;
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export const useProductSearch = (options: ProductSearchOptions = {}) => {
  const {
    query: initialQuery = '',
    limit = 100,
    orderBy = 'createdAt',
    orderDirection = 'desc',
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const queryParams = useMemo(() => ({
    query: searchQuery,
    limit,
    orderBy,
    orderDirection,
  }), [searchQuery, limit, orderBy, orderDirection]);

  const {
    data: products,
    isLoading,
    error,
  } = useOfflineProducts(queryParams);

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    products,
    allProducts: products,
    isLoading,
    error,
  };
};

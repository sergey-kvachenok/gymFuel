import { useState, useCallback } from 'react';
import { trpc } from '../lib/trpc-client';

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

  const {
    data: products,
    isLoading,
    error,
  } = trpc.product.getAll.useQuery({
    query: searchQuery,
    limit,
    orderBy,
    orderDirection,
  });

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    products,
    allProducts: products,
    isLoading,
    error,
  };
};

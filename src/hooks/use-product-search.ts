import { useState, useEffect } from 'react';
import { UnifiedDataService } from '../lib/unified-data-service';
import { UnifiedProduct } from '../lib/unified-offline-db';

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
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use a singleton instance of UnifiedDataService
  const unifiedDataService = UnifiedDataService.getInstance();

  // Function to manually refresh products
  const refreshProducts = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) {
        setProducts([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const allProducts = await unifiedDataService.getProducts(userId);

        // Apply search filter if query is provided
        let filteredProducts = allProducts;
        if (searchQuery.trim()) {
          filteredProducts = allProducts.filter((product: UnifiedProduct) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        // Apply sorting
        filteredProducts.sort((a: UnifiedProduct, b: UnifiedProduct) => {
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

        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [userId, searchQuery, orderBy, orderDirection, limit, unifiedDataService, refreshTrigger]);

  return {
    searchQuery,
    setSearchQuery,
    products,
    allProducts: products,
    isLoading,
    error,
    refreshProducts,
  };
};

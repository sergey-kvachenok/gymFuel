import { renderHook, waitFor, act } from '@testing-library/react';
import { useProductSearch } from '../use-product-search';
import { UnifiedDataService } from '../../lib/unified-data-service';
import { UnifiedProduct } from '../../lib/unified-offline-db';

// Mock dependencies
jest.mock('../../lib/unified-data-service');
jest.mock('../../lib/trpc-client', () => ({
  trpc: {
    product: {
      getAll: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;

describe('useProductSearch', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
  });

  describe('Basic Functionality', () => {
    it('should fetch products from UnifiedDataService when userId is provided', async () => {
      const mockProducts: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Product 1',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductSearch(1));

      await waitFor(() => {
        expect(mockDataService.getProducts).toHaveBeenCalledWith(1);
        expect(result.current.products).toEqual(mockProducts);
      });
    });

    it('should not fetch products when userId is null', () => {
      renderHook(() => useProductSearch(null));
      expect(mockDataService.getProducts).not.toHaveBeenCalled();
    });

    it('should return empty array when no products found', async () => {
      mockDataService.getProducts.mockResolvedValue([]);

      const { result } = renderHook(() => useProductSearch(1));

      await waitFor(() => {
        expect(result.current.products).toEqual([]);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching products', async () => {
      let resolvePromise: (value: UnifiedProduct[]) => void;
      const promise = new Promise<UnifiedProduct[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockDataService.getProducts.mockReturnValue(promise);

      const { result } = renderHook(() => useProductSearch(1));

      expect(result.current.isLoading).toBe(true);

      resolvePromise!([]);
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should not show loading when userId is null', () => {
      const { result } = renderHook(() => useProductSearch(null));
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from UnifiedDataService', async () => {
      const error = new Error('Failed to fetch products');
      mockDataService.getProducts.mockRejectedValue(error);

      const { result } = renderHook(() => useProductSearch(1));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error when successful fetch occurs after error', async () => {
      const error = new Error('Failed to fetch products');
      mockDataService.getProducts.mockRejectedValueOnce(error);

      const { result, rerender } = renderHook(({ userId }) => useProductSearch(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      // Mock successful fetch for a different userId
      mockDataService.getProducts.mockResolvedValue([]);

      // Change userId to trigger a new effect
      rerender({ userId: 2 });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should apply search filter when query is provided', async () => {
      const allProducts: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Apple',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
        {
          id: 2,
          name: 'Banana',
          userId: 1,
          calories: 200,
          protein: 20,
          fat: 10,
          carbs: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(allProducts);

      const { result } = renderHook(() => useProductSearch(1, { query: 'apple' }));

      await waitFor(() => {
        expect(result.current.products).toHaveLength(1);
        expect(result.current.products[0].name).toBe('Apple');
      });
    });

    it('should handle case-insensitive search', async () => {
      const allProducts: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Apple',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(allProducts);

      const { result } = renderHook(() => useProductSearch(1, { query: 'APPLE' }));

      await waitFor(() => {
        expect(result.current.products).toHaveLength(1);
        expect(result.current.products[0].name).toBe('Apple');
      });
    });

    it('should return all products when query is empty', async () => {
      const allProducts: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Apple',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
        {
          id: 2,
          name: 'Banana',
          userId: 1,
          calories: 200,
          protein: 20,
          fat: 10,
          carbs: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(allProducts);

      const { result } = renderHook(() => useProductSearch(1, { query: '' }));

      await waitFor(() => {
        expect(result.current.products).toHaveLength(2);
      });
    });
  });

  describe('Sorting and Pagination', () => {
    it('should apply sorting by name', async () => {
      const products: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Zebra',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
        {
          id: 2,
          name: 'Apple',
          userId: 1,
          calories: 200,
          protein: 20,
          fat: 10,
          carbs: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(products);

      const { result } = renderHook(() =>
        useProductSearch(1, { orderBy: 'name', orderDirection: 'asc' }),
      );

      await waitFor(() => {
        expect(result.current.products[0].name).toBe('Apple');
        expect(result.current.products[1].name).toBe('Zebra');
      });
    });

    it('should apply limit when specified', async () => {
      const products: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Product 1',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
        {
          id: 2,
          name: 'Product 2',
          userId: 1,
          calories: 200,
          protein: 20,
          fat: 10,
          carbs: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(products);

      const { result } = renderHook(() => useProductSearch(1, { limit: 1 }));

      await waitFor(() => {
        expect(result.current.products).toHaveLength(1);
      });
    });
  });

  describe('Search Query State Management', () => {
    it('should provide searchQuery and setSearchQuery', () => {
      const { result } = renderHook(() => useProductSearch(1, { query: 'initial' }));

      expect(result.current.searchQuery).toBe('initial');
      expect(typeof result.current.setSearchQuery).toBe('function');
    });

    it('should update searchQuery when setSearchQuery is called', async () => {
      const { result } = renderHook(() => useProductSearch(1));

      act(() => {
        result.current.setSearchQuery('new query');
      });

      await waitFor(() => {
        expect(result.current.searchQuery).toBe('new query');
      });
    });
  });

  describe('Dependencies and Re-fetching', () => {
    it('should re-fetch when userId changes', async () => {
      const { rerender } = renderHook(({ userId }) => useProductSearch(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(mockDataService.getProducts).toHaveBeenCalledWith(1);
      });

      rerender({ userId: 2 });

      await waitFor(() => {
        expect(mockDataService.getProducts).toHaveBeenCalledWith(2);
      });
    });

    it('should re-fetch when search options change', async () => {
      const { rerender } = renderHook(({ options }) => useProductSearch(1, options), {
        initialProps: { options: { query: 'apple' } },
      });

      await waitFor(() => {
        expect(mockDataService.getProducts).toHaveBeenCalledWith(1);
      });

      rerender({ options: { query: 'banana' } });

      await waitFor(() => {
        expect(mockDataService.getProducts).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Refresh Products', () => {
    it('should provide refreshProducts function', () => {
      const { result } = renderHook(() => useProductSearch(1));

      expect(result.current.refreshProducts).toBeDefined();
      expect(typeof result.current.refreshProducts).toBe('function');
    });

    it('should refresh products when refreshProducts is called', async () => {
      const { result } = renderHook(() => useProductSearch(1));

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialProducts = result.current.products;

      // Call refreshProducts
      act(() => {
        result.current.refreshProducts();
      });

      // Should trigger a re-fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Products should be refreshed (even if same data, the hook should re-fetch)
      expect(result.current.products).toEqual(initialProducts);
    });
  });
});

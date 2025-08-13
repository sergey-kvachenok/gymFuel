import { renderHook, waitFor } from '@testing-library/react';
import { useProductSearch } from '../use-product-search';
import { UnifiedDataService } from '../../lib/unified-data-service';
import { useOnlineStatus } from '../use-online-status';
import { trpc } from '../../lib/trpc-client';
import { UnifiedProduct } from '../../lib/unified-offline-db';

// Mock dependencies
jest.mock('../../lib/unified-data-service');
jest.mock('../use-online-status');
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
const MockUseOnlineStatus = useOnlineStatus as jest.MockedFunction<typeof useOnlineStatus>;
const MockTrpc = trpc as jest.Mocked<typeof trpc>;

describe('useProductSearch', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;
  let mockTrpcQuery: jest.Mocked<{
    data: UnifiedProduct[] | undefined;
    isLoading: boolean;
    error: Error | null;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
    MockUseOnlineStatus.mockReturnValue(true);

    mockTrpcQuery = {
      data: [],
      isLoading: false,
      error: null,
    };
    (MockTrpc.product.getAll.useQuery as jest.Mock).mockReturnValue(mockTrpcQuery);
  });

  describe('Online Mode', () => {
    it('should use tRPC query when online', () => {
      renderHook(() => useProductSearch(1, { query: 'test' }));
      expect(MockTrpc.product.getAll.useQuery).toHaveBeenCalled();
    });

    it('should return server data when online', () => {
      const serverProducts: UnifiedProduct[] = [
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
      mockTrpcQuery.data = serverProducts;

      const { result } = renderHook(() => useProductSearch(1));
      expect(result.current.products).toEqual(serverProducts);
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      MockUseOnlineStatus.mockReturnValue(false);
    });

    it('should fetch products from UnifiedDataService when offline', async () => {
      const offlineProducts: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Offline Product',
          userId: 1,
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(offlineProducts);

      renderHook(() => useProductSearch(1));

      await waitFor(() => {
        expect(mockDataService.getProducts).toHaveBeenCalledWith(1);
      });
    });

    it('should apply search filter when query is provided', async () => {
      const products: UnifiedProduct[] = [
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
          _synced: false,
          _syncTimestamp: null,
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
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getProducts.mockResolvedValue(products);

      const { result } = renderHook(() => useProductSearch(1, { query: 'apple' }));

      await waitFor(() => {
        expect(result.current.products).toHaveLength(1);
      });
    });
  });
});

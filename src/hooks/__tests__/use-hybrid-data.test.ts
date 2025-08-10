import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { trpc } from '../../lib/trpc-client';
import { useHybridProductSearch } from '../use-hybrid-product-search';
import { useHybridConsumptionQueries } from '../use-hybrid-consumption-queries';
import { useHybridNutritionGoals } from '../use-hybrid-nutrition-goals';
import { offlineDataService } from '../../lib/offline-data-service';
import { useOnlineStatus } from '../use-online-status';

// Mock dependencies
jest.mock('../../lib/trpc-client');
jest.mock('../../lib/offline-data-service');
jest.mock('../use-online-status');

const mockTrpc = trpc as jest.Mocked<typeof trpc>;
const mockOfflineDataService = offlineDataService as jest.Mocked<typeof offlineDataService>;
const mockUseOnlineStatus = useOnlineStatus as jest.MockedFunction<typeof useOnlineStatus>;

// Mock React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Hybrid Data Layer Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHybridProductSearch', () => {
    const mockProducts = [
      { id: 1, name: 'Apple', calories: 52, protein: 0.3, fat: 0.2, carbs: 14, userId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Banana', calories: 89, protein: 1.1, fat: 0.3, carbs: 23, userId: 1, createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should fetch from server when online', async () => {
      mockUseOnlineStatus.mockReturnValue(true);
      mockTrpc.product.getAll.useQuery.mockReturnValue({
        data: mockProducts,
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useHybridProductSearch(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.products).toEqual(mockProducts);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockTrpc.product.getAll.useQuery).toHaveBeenCalled();
      expect(mockOfflineDataService.getProducts).not.toHaveBeenCalled();
    });

    it('should fetch from IndexedDB when offline', async () => {
      mockUseOnlineStatus.mockReturnValue(false);
      mockOfflineDataService.getProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useHybridProductSearch(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.products).toEqual(mockProducts);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOfflineDataService.getProducts).toHaveBeenCalledWith(1); // userId
      expect(mockTrpc.product.getAll.useQuery).not.toHaveBeenCalled();
    });

    it('should cache server data to IndexedDB when online', async () => {
      mockUseOnlineStatus.mockReturnValue(true);
      mockTrpc.product.getAll.useQuery.mockReturnValue({
        data: mockProducts,
        isLoading: false,
        error: null,
      } as any);

      renderHook(() => useHybridProductSearch(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockOfflineDataService.cacheServerProducts).toHaveBeenCalledWith(mockProducts);
      });
    });

    it('should merge offline changes with server data', async () => {
      mockUseOnlineStatus.mockReturnValue(true);
      const serverProducts = [{ id: 1, name: 'Apple', calories: 52, protein: 0.3, fat: 0.2, carbs: 14, userId: 1, createdAt: new Date(), updatedAt: new Date() }];
      const offlineChanges = [{ id: 1, name: 'Apple Updated', calories: 55, protein: 0.3, fat: 0.2, carbs: 14, userId: 1, createdAt: new Date(), updatedAt: new Date() }];
      
      mockTrpc.product.getAll.useQuery.mockReturnValue({
        data: serverProducts,
        isLoading: false,
        error: null,
      } as any);
      mockOfflineDataService.getOfflineChanges.mockResolvedValue(offlineChanges);

      const { result } = renderHook(() => useHybridProductSearch(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.products).toEqual(offlineChanges); // Should show offline changes
      });
    });
  });

  describe('useHybridConsumptionQueries', () => {
    const mockConsumptions = [
      { id: 1, amount: 100, productId: 1, userId: 1, date: new Date(), createdAt: new Date(), updatedAt: new Date(), product: { id: 1, name: 'Apple', calories: 52, protein: 0.3, fat: 0.2, carbs: 14, userId: 1, createdAt: new Date(), updatedAt: new Date() } },
    ];

    const mockDailyStats = {
      date: '2024-01-01',
      totalCalories: 52,
      totalProtein: 0.3,
      totalFat: 0.2,
      totalCarbs: 14,
      consumptionsCount: 1,
    };

    describe('getDailyStats', () => {
      it('should fetch from server when online', async () => {
        mockUseOnlineStatus.mockReturnValue(true);
        mockTrpc.consumption.getDailyStats.useQuery.mockReturnValue({
          data: mockDailyStats,
          isLoading: false,
          error: null,
        } as any);

        const { result } = renderHook(() => useHybridConsumptionQueries().getDailyStats(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockDailyStats);
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockTrpc.consumption.getDailyStats.useQuery).toHaveBeenCalled();
        expect(mockOfflineDataService.getConsumptions).not.toHaveBeenCalled();
      });

      it('should calculate from IndexedDB when offline', async () => {
        mockUseOnlineStatus.mockReturnValue(false);
        mockOfflineDataService.getConsumptions.mockResolvedValue(mockConsumptions);

        const { result } = renderHook(() => useHybridConsumptionQueries().getDailyStats(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockDailyStats);
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockOfflineDataService.getConsumptions).toHaveBeenCalled();
        expect(mockTrpc.consumption.getDailyStats.useQuery).not.toHaveBeenCalled();
      });
    });

    describe('getByDate', () => {
      it('should fetch from server when online', async () => {
        mockUseOnlineStatus.mockReturnValue(true);
        mockTrpc.consumption.getByDate.useQuery.mockReturnValue({
          data: mockConsumptions,
          isLoading: false,
          error: null,
        } as any);

        const { result } = renderHook(() => useHybridConsumptionQueries().getByDate(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockConsumptions);
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockTrpc.consumption.getByDate.useQuery).toHaveBeenCalled();
        expect(mockOfflineDataService.getConsumptions).not.toHaveBeenCalled();
      });

      it('should fetch from IndexedDB when offline', async () => {
        mockUseOnlineStatus.mockReturnValue(false);
        mockOfflineDataService.getConsumptions.mockResolvedValue(mockConsumptions);

        const { result } = renderHook(() => useHybridConsumptionQueries().getByDate(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockConsumptions);
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockOfflineDataService.getConsumptions).toHaveBeenCalled();
        expect(mockTrpc.consumption.getByDate.useQuery).not.toHaveBeenCalled();
      });
    });
  });

  describe('useHybridNutritionGoals', () => {
    const mockGoals = {
      id: 1,
      userId: 1,
      calories: 2000,
      protein: 150,
      fat: 65,
      carbs: 250,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should fetch from server when online', async () => {
      mockUseOnlineStatus.mockReturnValue(true);
      mockTrpc.goals.get.useQuery.mockReturnValue({
        data: mockGoals,
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useHybridNutritionGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockGoals);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockTrpc.goals.get.useQuery).toHaveBeenCalled();
      expect(mockOfflineDataService.getNutritionGoals).not.toHaveBeenCalled();
    });

    it('should fetch from IndexedDB when offline', async () => {
      mockUseOnlineStatus.mockReturnValue(false);
      mockOfflineDataService.getNutritionGoals.mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useHybridNutritionGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockGoals);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOfflineDataService.getNutritionGoals).toHaveBeenCalledWith(1); // userId
      expect(mockTrpc.goals.get.useQuery).not.toHaveBeenCalled();
    });

    it('should cache server data to IndexedDB when online', async () => {
      mockUseOnlineStatus.mockReturnValue(true);
      mockTrpc.goals.get.useQuery.mockReturnValue({
        data: mockGoals,
        isLoading: false,
        error: null,
      } as any);

      renderHook(() => useHybridNutritionGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockOfflineDataService.cacheServerNutritionGoals).toHaveBeenCalledWith(mockGoals);
      });
    });
  });
});

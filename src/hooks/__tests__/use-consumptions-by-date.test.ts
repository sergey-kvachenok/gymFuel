import { renderHook, waitFor, act } from '@testing-library/react';
import { useConsumptionsByDate } from '../use-consumptions-by-date';
import { UnifiedDataService } from '../../lib/unified-data-service';
import { UnifiedConsumption } from '../../lib/unified-data-service';

// Mock dependencies
jest.mock('../../lib/unified-data-service');
jest.mock('../../lib/trpc-client', () => ({
  trpc: {
    consumption: {
      getByDate: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;

describe('useConsumptionsByDate', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
  });

  describe('Basic Functionality', () => {
    it('should fetch consumptions from UnifiedDataService when userId is provided', async () => {
      const mockConsumptions: UnifiedConsumption[] = [
        {
          id: 1,
          userId: 1,
          productId: 1,
          amount: 100,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 1,
            name: 'Test Product',
            userId: 1,
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];
      mockDataService.getConsumptionsByDateRange.mockResolvedValue(mockConsumptions);

      const { result } = renderHook(() => useConsumptionsByDate(1));

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledWith(
          1,
          expect.any(Date), // startOfDay
          expect.any(Date), // endOfDay
        );
        expect(result.current.data).toEqual(mockConsumptions);
      });
    });

    it('should not fetch consumptions when userId is null', () => {
      renderHook(() => useConsumptionsByDate(null));
      expect(mockDataService.getConsumptionsByDateRange).not.toHaveBeenCalled();
    });

    it('should return empty array when no consumptions found', async () => {
      mockDataService.getConsumptionsByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useConsumptionsByDate(1));

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
      });
    });

    it('should fetch consumptions for today by default', async () => {
      mockDataService.getConsumptionsByDateRange.mockResolvedValue([]);

      renderHook(() => useConsumptionsByDate(1));

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledWith(
          1,
          expect.any(Date),
          expect.any(Date),
        );
      });

      // Verify the date range is for today
      const callArgs = mockDataService.getConsumptionsByDateRange.mock.calls[0];
      const startDate = callArgs[1] as Date;
      const endDate = callArgs[2] as Date;
      const today = new Date();

      expect(startDate.getDate()).toBe(today.getDate());
      expect(startDate.getMonth()).toBe(today.getMonth());
      expect(startDate.getFullYear()).toBe(today.getFullYear());
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);

      expect(endDate.getDate()).toBe(today.getDate());
      expect(endDate.getMonth()).toBe(today.getMonth());
      expect(endDate.getFullYear()).toBe(today.getFullYear());
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching consumptions', async () => {
      let resolvePromise: (value: UnifiedConsumption[]) => void;
      const promise = new Promise<UnifiedConsumption[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockDataService.getConsumptionsByDateRange.mockReturnValue(promise);

      const { result } = renderHook(() => useConsumptionsByDate(1));

      expect(result.current.isLoading).toBe(true);

      resolvePromise!([]);
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should not show loading when userId is null', () => {
      const { result } = renderHook(() => useConsumptionsByDate(null));
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from UnifiedDataService', async () => {
      const error = new Error('Failed to fetch consumptions');
      mockDataService.getConsumptionsByDateRange.mockRejectedValue(error);

      const { result } = renderHook(() => useConsumptionsByDate(1));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error when successful fetch occurs after error', async () => {
      const error = new Error('Failed to fetch consumptions');
      mockDataService.getConsumptionsByDateRange.mockRejectedValueOnce(error);

      const { result, rerender } = renderHook(({ userId }) => useConsumptionsByDate(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      // Mock successful fetch for a different userId
      mockDataService.getConsumptionsByDateRange.mockResolvedValue([]);

      // Change userId to trigger a new effect
      rerender({ userId: 2 });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should provide refreshOfflineData function', () => {
      const { result } = renderHook(() => useConsumptionsByDate(1));

      expect(typeof result.current.refreshOfflineData).toBe('function');
    });

    it('should refresh data when refreshOfflineData is called', async () => {
      mockDataService.getConsumptionsByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useConsumptionsByDate(1));

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.refreshOfflineData();
      });

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Dependencies and Re-fetching', () => {
    it('should re-fetch when userId changes', async () => {
      const { rerender } = renderHook(({ userId }) => useConsumptionsByDate(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledWith(
          1,
          expect.any(Date),
          expect.any(Date),
        );
      });

      rerender({ userId: 2 });

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledWith(
          2,
          expect.any(Date),
          expect.any(Date),
        );
      });
    });

    it('should not re-fetch when userId remains the same', async () => {
      const { rerender } = renderHook(({ userId }) => useConsumptionsByDate(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledTimes(1);
      });

      rerender({ userId: 1 });

      // Should not trigger another fetch
      expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Date Range Calculation', () => {
    it('should calculate correct start and end of day', async () => {
      mockDataService.getConsumptionsByDateRange.mockResolvedValue([]);

      renderHook(() => useConsumptionsByDate(1));

      await waitFor(() => {
        expect(mockDataService.getConsumptionsByDateRange).toHaveBeenCalledWith(
          1,
          expect.any(Date),
          expect.any(Date),
        );
      });

      const callArgs = mockDataService.getConsumptionsByDateRange.mock.calls[0];
      const startDate = callArgs[1] as Date;
      const endDate = callArgs[2] as Date;

      // Verify start of day
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);
      expect(startDate.getMilliseconds()).toBe(0);

      // Verify end of day
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
      expect(endDate.getMilliseconds()).toBe(999);

      // Verify both dates are for the same day
      expect(startDate.getDate()).toBe(endDate.getDate());
      expect(startDate.getMonth()).toBe(endDate.getMonth());
      expect(startDate.getFullYear()).toBe(endDate.getFullYear());
    });
  });
});

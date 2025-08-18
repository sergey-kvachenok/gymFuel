import { renderHook, waitFor } from '@testing-library/react';
import { useNutritionGoals } from '../use-nutrition-goals';
import { UnifiedDataService } from '../../lib/unified-data-service';
import { UnifiedNutritionGoals } from '../../lib/unified-data-service';

// Mock dependencies
jest.mock('../../lib/unified-data-service');
jest.mock('../../lib/trpc-client', () => ({
  trpc: {
    goals: {
      get: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;

describe('useNutritionGoals', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
  });

  describe('Basic Functionality', () => {
    it('should fetch nutrition goals from UnifiedDataService when userId is provided', async () => {
      const mockGoals: UnifiedNutritionGoals = {
        id: 1,
        userId: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: 'maintenance',
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: true,
        _syncTimestamp: new Date(),
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      };
      mockDataService.getNutritionGoals.mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useNutritionGoals(1));

      await waitFor(() => {
        expect(mockDataService.getNutritionGoals).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual(mockGoals);
      });
    });

    it('should not fetch nutrition goals when userId is null', () => {
      renderHook(() => useNutritionGoals(null));
      expect(mockDataService.getNutritionGoals).not.toHaveBeenCalled();
    });

    it('should return null when no nutrition goals found', async () => {
      mockDataService.getNutritionGoals.mockResolvedValue(null);

      const { result } = renderHook(() => useNutritionGoals(1));

      await waitFor(() => {
        expect(result.current.data).toBeNull();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching nutrition goals', async () => {
      let resolvePromise: (value: UnifiedNutritionGoals | null) => void;
      const promise = new Promise<UnifiedNutritionGoals | null>((resolve) => {
        resolvePromise = resolve;
      });
      mockDataService.getNutritionGoals.mockReturnValue(promise);

      const { result } = renderHook(() => useNutritionGoals(1));

      expect(result.current.isLoading).toBe(true);

      resolvePromise!(null);
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should not show loading when userId is null', () => {
      const { result } = renderHook(() => useNutritionGoals(null));
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from UnifiedDataService', async () => {
      const error = new Error('Failed to fetch nutrition goals');
      mockDataService.getNutritionGoals.mockRejectedValue(error);

      const { result } = renderHook(() => useNutritionGoals(1));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error when successful fetch occurs after error', async () => {
      const error = new Error('Failed to fetch nutrition goals');
      mockDataService.getNutritionGoals.mockRejectedValueOnce(error);

      const { result, rerender } = renderHook(({ userId }) => useNutritionGoals(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      // Mock successful fetch for a different userId
      mockDataService.getNutritionGoals.mockResolvedValue(null);

      // Change userId to trigger a new effect
      rerender({ userId: 2 });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Dependencies and Re-fetching', () => {
    it('should re-fetch when userId changes', async () => {
      const { rerender } = renderHook(({ userId }) => useNutritionGoals(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(mockDataService.getNutritionGoals).toHaveBeenCalledWith(1);
      });

      rerender({ userId: 2 });

      await waitFor(() => {
        expect(mockDataService.getNutritionGoals).toHaveBeenCalledWith(2);
      });
    });

    it('should not re-fetch when userId remains the same', async () => {
      const { rerender } = renderHook(({ userId }) => useNutritionGoals(userId), {
        initialProps: { userId: 1 },
      });

      await waitFor(() => {
        expect(mockDataService.getNutritionGoals).toHaveBeenCalledTimes(1);
      });

      rerender({ userId: 1 });

      // Should not trigger another fetch
      expect(mockDataService.getNutritionGoals).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Structure', () => {
    it('should handle complete nutrition goals data', async () => {
      const mockGoals: UnifiedNutritionGoals = {
        id: 1,
        userId: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: 'weight_loss',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        _synced: true,
        _syncTimestamp: new Date('2024-01-15'),
        _syncError: null,
        _lastModified: new Date('2024-01-15'),
        _version: 1,
      };
      mockDataService.getNutritionGoals.mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useNutritionGoals(1));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockGoals);
        expect(result.current.data?.dailyCalories).toBe(2000);
        expect(result.current.data?.dailyProtein).toBe(150);
        expect(result.current.data?.dailyFat).toBe(65);
        expect(result.current.data?.dailyCarbs).toBe(250);
        expect(result.current.data?.goalType).toBe('weight_loss');
      });
    });

    it('should handle nutrition goals with different goal types', async () => {
      const mockGoals: UnifiedNutritionGoals = {
        id: 1,
        userId: 1,
        dailyCalories: 2500,
        dailyProtein: 200,
        dailyFat: 80,
        dailyCarbs: 300,
        goalType: 'muscle_gain',
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: true,
        _syncTimestamp: new Date(),
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      };
      mockDataService.getNutritionGoals.mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useNutritionGoals(1));

      await waitFor(() => {
        expect(result.current.data?.goalType).toBe('muscle_gain');
        expect(result.current.data?.dailyCalories).toBe(2500);
      });
    });
  });
});

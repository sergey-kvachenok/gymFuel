import { renderHook, act } from '@testing-library/react';
import { useProductManipulation } from '../use-product-manipulation';
import { UnifiedDataService } from '../../lib/unified-data-service';
import { useOnlineStatus } from '../use-online-status';
import { trpc } from '../../lib/trpc-client';

// Mock dependencies
jest.mock('../../lib/unified-data-service');
jest.mock('../use-online-status');
jest.mock('../../lib/trpc-client', () => ({
  trpc: {
    useUtils: jest.fn(() => ({
      product: {
        getAll: {
          invalidate: jest.fn(),
        },
      },
    })),
    product: {
      update: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
    },
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;
const MockUseOnlineStatus = useOnlineStatus as jest.MockedFunction<typeof useOnlineStatus>;
const MockTrpc = trpc as jest.Mocked<typeof trpc>;

describe('useProductManipulation', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;
  let mockUpdateMutation: jest.Mocked<{
    mutate: jest.MockedFunction<(data: unknown) => void>;
    isPending: boolean;
    error: Error | null;
  }>;
  let mockDeleteMutation: jest.Mocked<{
    mutate: jest.MockedFunction<(data: unknown) => void>;
    isPending: boolean;
    error: Error | null;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
    MockUseOnlineStatus.mockReturnValue(true);

    mockUpdateMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
    };
    mockDeleteMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
    };

    (MockTrpc.product.update.useMutation as jest.Mock).mockReturnValue(mockUpdateMutation);
    (MockTrpc.product.delete.useMutation as jest.Mock).mockReturnValue(mockDeleteMutation);
  });

  describe('Online Mode', () => {
    it('should use tRPC mutation when online for update', async () => {
      const { result } = renderHook(() => useProductManipulation(1));

      await act(async () => {
        await result.current.updateProduct({
          id: 1,
          name: 'Updated Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
        });
      });

      expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated Product',
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 20,
      });
    });

    it('should use tRPC mutation when online for delete', async () => {
      const { result } = renderHook(() => useProductManipulation(1));

      await act(async () => {
        await result.current.deleteProduct({ id: 1 });
      });

      expect(mockDeleteMutation.mutate).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      MockUseOnlineStatus.mockReturnValue(false);
    });

    it('should use UnifiedDataService when offline for update', async () => {
      mockDataService.updateProduct.mockResolvedValue({
        id: 1,
        name: 'Updated Product',
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 20,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      });

      const { result } = renderHook(() => useProductManipulation(1));

      await act(async () => {
        await result.current.updateProduct({
          id: 1,
          name: 'Updated Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
        });
      });

      expect(mockDataService.updateProduct).toHaveBeenCalledWith(1, {
        id: 1,
        name: 'Updated Product',
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 20,
      });
    });

    it('should use UnifiedDataService when offline for delete', async () => {
      mockDataService.deleteProduct.mockResolvedValue();

      const { result } = renderHook(() => useProductManipulation(1));

      await act(async () => {
        await result.current.deleteProduct({ id: 1 });
      });

      expect(mockDataService.deleteProduct).toHaveBeenCalledWith(1);
    });

    it('should handle errors when offline update fails', async () => {
      const consoleSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockDataService.updateProduct.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useProductManipulation(1));

      await act(async () => {
        await result.current.updateProduct({
          id: 1,
          name: 'Updated Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
        });
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error updating product offline: Update failed');
      consoleSpy.mockRestore();
    });

    it('should handle errors when offline delete fails', async () => {
      const consoleSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockDataService.deleteProduct.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useProductManipulation(1));

      await act(async () => {
        await result.current.deleteProduct({ id: 1 });
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting product offline: Delete failed');
      consoleSpy.mockRestore();
    });

    it('should show error when userId is null', async () => {
      const consoleSpy = jest.spyOn(window, 'alert').mockImplementation();

      const { result } = renderHook(() => useProductManipulation(null));

      await act(async () => {
        await result.current.updateProduct({
          id: 1,
          name: 'Updated Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
        });
      });

      expect(consoleSpy).toHaveBeenCalledWith('User not authenticated');
      consoleSpy.mockRestore();
    });
  });

  describe('Return Values', () => {
    it('should return loading states', () => {
      mockUpdateMutation.isPending = true;
      mockDeleteMutation.isPending = false;

      const { result } = renderHook(() => useProductManipulation(1));

      expect(result.current.isUpdating).toBe(true);
      expect(result.current.isDeleting).toBe(false);
    });

    it('should return error states', () => {
      const updateError = new Error('Update error');
      const deleteError = new Error('Delete error');

      mockUpdateMutation.error = updateError;
      mockDeleteMutation.error = deleteError;

      const { result } = renderHook(() => useProductManipulation(1));

      expect(result.current.updateError).toBe(updateError);
      expect(result.current.deleteError).toBe(deleteError);
    });
  });
});

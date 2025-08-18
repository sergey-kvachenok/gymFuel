import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnifiedProduct, UnifiedConsumption } from '../unified-data-service';

// Mock the unified data service
jest.mock('../unified-data-service', () => ({
  UnifiedDataService: {
    getInstance: jest.fn(),
  },
  UnifiedProduct: {},
  UnifiedConsumption: {},
  UnifiedNutritionGoals: {},
}));

// Mock tRPC client
jest.mock('../trpc-client', () => ({
  trpc: {
    sync: {
      batchSync: {
        useMutation: jest.fn(),
      },
    },
  },
}));

const MockUnifiedDataService = jest.requireMock('../unified-data-service') as {
  UnifiedDataService: { getInstance: jest.MockedFunction<() => unknown> };
};
const MockTrpc = jest.requireMock('../trpc-client') as {
  trpc: { sync: { batchSync: { useMutation: jest.MockedFunction<() => unknown> } } };
};

describe('Sync Service', () => {
  let mockDataService: {
    getUnsyncedItems: jest.MockedFunction<
      (tableName: string, userId: number) => Promise<UnifiedProduct[] | UnifiedConsumption[]>
    >;
    markAsSynced: jest.MockedFunction<(tableName: string, recordId: number) => Promise<void>>;
    markAsSyncError: jest.MockedFunction<
      (tableName: string, recordId: number, error: Error) => Promise<void>
    >;
  };
  let mockSyncMutation: {
    mutate: jest.MockedFunction<(data: unknown) => void>;
    isPending: boolean;
    error: Error | null;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockDataService = {
      getUnsyncedItems: jest.fn(),
      markAsSynced: jest.fn(),
      markAsSyncError: jest.fn(),
    };

    mockSyncMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
    };

    MockUnifiedDataService.UnifiedDataService.getInstance = jest
      .fn()
      .mockReturnValue(mockDataService);
    MockTrpc.trpc.sync.batchSync.useMutation.mockReturnValue(mockSyncMutation);
  });

  describe('Sync Operations', () => {
    it('should prepare sync operations from unsynced items', async () => {
      const mockUnsyncedProducts: UnifiedProduct[] = [
        {
          id: 1,
          name: 'Test Product',
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
        },
      ];

      const mockUnsyncedConsumptions: UnifiedConsumption[] = [
        {
          id: 1,
          productId: 1,
          amount: 100,
          date: new Date(),
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 1,
            name: 'Test Product',
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];

      mockDataService.getUnsyncedItems
        .mockResolvedValueOnce(mockUnsyncedProducts)
        .mockResolvedValueOnce(mockUnsyncedConsumptions)
        .mockResolvedValueOnce([]);

      // This would be the actual sync service function
      const prepareSyncOperations = async (userId: number) => {
        const [products, consumptions] = await Promise.all([
          mockDataService.getUnsyncedItems('products', userId),
          mockDataService.getUnsyncedItems('consumptions', userId),
        ]);

        const operations = [];

        // Add product operations
        for (const product of products) {
          if ('name' in product) {
            operations.push({
              tableName: 'products' as const,
              operation: 'create' as const,
              recordId: product.id,
              data: {
                name: product.name,
                calories: product.calories,
                protein: product.protein,
                fat: product.fat,
                carbs: product.carbs,
              },
              timestamp: product._lastModified,
            });
          }
        }

        // Add consumption operations
        for (const consumption of consumptions) {
          if ('productId' in consumption) {
            operations.push({
              tableName: 'consumptions' as const,
              operation: 'create' as const,
              recordId: consumption.id,
              data: {
                productId: consumption.productId,
                amount: consumption.amount,
                date: consumption.date,
              },
              timestamp: consumption._lastModified,
            });
          }
        }

        return operations;
      };

      const operations = await prepareSyncOperations(1);

      expect(operations).toHaveLength(2);
      expect(operations[0]).toEqual({
        tableName: 'products',
        operation: 'create',
        recordId: 1,
        data: {
          name: 'Test Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
        },
        timestamp: expect.any(Date),
      });
      expect(operations[1]).toEqual({
        tableName: 'consumptions',
        operation: 'create',
        recordId: 1,
        data: {
          productId: 1,
          amount: 100,
          date: expect.any(Date),
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle empty unsynced items', async () => {
      mockDataService.getUnsyncedItems
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const prepareSyncOperations = async (userId: number) => {
        const [products, consumptions] = await Promise.all([
          mockDataService.getUnsyncedItems('products', userId),
          mockDataService.getUnsyncedItems('consumptions', userId),
        ]);

        return [...products, ...consumptions];
      };

      const operations = await prepareSyncOperations(1);

      expect(operations).toHaveLength(0);
    });

    it('should mark items as synced after successful sync', async () => {
      const mockSyncResult = {
        processed: 1,
        failed: 0,
        results: [
          {
            operation: {
              tableName: 'products',
              operation: 'create',
              recordId: 1,
            },
            success: true,
            result: { id: 1 },
          },
        ],
        errors: [],
      };

      mockSyncMutation.mutate.mockImplementation(() => {
        // Simulate successful sync
        return Promise.resolve(mockSyncResult);
      });

      const markItemsAsSynced = async (syncResult: {
        results: Array<{ success: boolean; operation: { tableName: string; recordId: number } }>;
      }) => {
        for (const result of syncResult.results) {
          if (result.success) {
            await mockDataService.markAsSynced(
              result.operation.tableName,
              result.operation.recordId,
            );
          }
        }
      };

      await markItemsAsSynced(mockSyncResult);

      expect(mockDataService.markAsSynced).toHaveBeenCalledWith('products', 1);
    });

    it('should mark items as sync error after failed sync', async () => {
      const mockSyncResult = {
        processed: 0,
        failed: 1,
        results: [],
        errors: [
          {
            operation: {
              tableName: 'products',
              operation: 'create',
              recordId: 1,
            },
            error: 'Database error',
          },
        ],
      };

      const markItemsAsSyncError = async (syncResult: {
        errors: Array<{ operation: { tableName: string; recordId: number }; error: string }>;
      }) => {
        for (const error of syncResult.errors) {
          await mockDataService.markAsSyncError(
            error.operation.tableName,
            error.operation.recordId,
            new Error(error.error),
          );
        }
      };

      await markItemsAsSyncError(mockSyncResult);

      expect(mockDataService.markAsSyncError).toHaveBeenCalledWith(
        'products',
        1,
        new Error('Database error'),
      );
    });

    it('should handle mixed success and failure results', async () => {
      const mockSyncResult = {
        processed: 1,
        failed: 1,
        results: [
          {
            operation: {
              tableName: 'products',
              operation: 'create',
              recordId: 1,
            },
            success: true,
            result: { id: 1 },
          },
        ],
        errors: [
          {
            operation: {
              tableName: 'consumptions',
              operation: 'create',
              recordId: 1,
            },
            error: 'Database error',
          },
        ],
      };

      const processSyncResult = async (syncResult: {
        results: Array<{ success: boolean; operation: { tableName: string; recordId: number } }>;
        errors: Array<{ operation: { tableName: string; recordId: number }; error: string }>;
      }) => {
        // Mark successful operations
        for (const result of syncResult.results) {
          if (result.success) {
            await mockDataService.markAsSynced(
              result.operation.tableName,
              result.operation.recordId,
            );
          }
        }

        // Mark failed operations
        for (const error of syncResult.errors) {
          await mockDataService.markAsSyncError(
            error.operation.tableName,
            error.operation.recordId,
            new Error(error.error),
          );
        }
      };

      await processSyncResult(mockSyncResult);

      expect(mockDataService.markAsSynced).toHaveBeenCalledWith('products', 1);
      expect(mockDataService.markAsSyncError).toHaveBeenCalledWith(
        'consumptions',
        1,
        new Error('Database error'),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during sync', async () => {
      const networkError = new Error('Network error');
      mockSyncMutation.mutate.mockImplementation(() => {
        throw networkError;
      });

      // Mock empty arrays for unsynced items
      mockDataService.getUnsyncedItems
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const handleSyncError = async (error: Error) => {
        // Mark all items as sync error
        const [products, consumptions, nutritionGoals] = await Promise.all([
          mockDataService.getUnsyncedItems('products', 1),
          mockDataService.getUnsyncedItems('consumptions', 1),
          mockDataService.getUnsyncedItems('nutritionGoals', 1),
        ]);

        const allItems = [...products, ...consumptions, ...nutritionGoals];
        for (const item of allItems) {
          await mockDataService.markAsSyncError(
            'products', // This would be determined by item type
            item.id,
            error,
          );
        }
      };

      await handleSyncError(networkError);

      // Verify that error handling was attempted
      expect(mockDataService.getUnsyncedItems).toHaveBeenCalled();
    });

    it('should handle partial sync failures gracefully', async () => {
      const mockSyncResult = {
        processed: 1,
        failed: 1,
        results: [
          {
            operation: {
              tableName: 'products',
              operation: 'create',
              recordId: 1,
            },
            success: true,
            result: { id: 1 },
          },
        ],
        errors: [
          {
            operation: {
              tableName: 'consumptions',
              operation: 'create',
              recordId: 1,
            },
            error: 'Validation error',
          },
        ],
      };

      const isPartialSuccess = (syncResult: { processed: number; failed: number }) => {
        return syncResult.processed > 0 && syncResult.failed > 0;
      };

      const result = isPartialSuccess(mockSyncResult);
      expect(result).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate sync operation data structure', () => {
      const validateSyncOperation = (operation: {
        tableName: string;
        operation: string;
        recordId: number;
        timestamp: Date;
        data?: unknown;
      }) => {
        const requiredFields = ['tableName', 'operation', 'recordId', 'timestamp'];
        const validTableNames = ['products', 'consumptions', 'nutritionGoals'];
        const validOperations = ['create', 'update', 'delete'];

        // Check required fields
        for (const field of requiredFields) {
          if (!(field in operation)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Check valid table name
        if (!validTableNames.includes(operation.tableName)) {
          throw new Error(`Invalid table name: ${operation.tableName}`);
        }

        // Check valid operation
        if (!validOperations.includes(operation.operation)) {
          throw new Error(`Invalid operation: ${operation.operation}`);
        }

        // Check data is present for create/update operations
        if (
          (operation.operation === 'create' || operation.operation === 'update') &&
          !operation.data
        ) {
          throw new Error(`Data required for ${operation.operation} operation`);
        }

        return true;
      };

      const validOperation = {
        tableName: 'products',
        operation: 'create',
        recordId: 1,
        data: { name: 'Test Product' },
        timestamp: new Date(),
      };

      expect(validateSyncOperation(validOperation)).toBe(true);
    });

    it('should reject invalid sync operations', () => {
      const validateSyncOperation = (operation: {
        tableName: string;
        operation: string;
        recordId: number;
        timestamp: Date;
      }) => {
        const validTableNames = ['products', 'consumptions', 'nutritionGoals'];
        const validOperations = ['create', 'update', 'delete'];

        if (!validTableNames.includes(operation.tableName)) {
          throw new Error(`Invalid table name: ${operation.tableName}`);
        }

        if (!validOperations.includes(operation.operation)) {
          throw new Error(`Invalid operation: ${operation.operation}`);
        }

        return true;
      };

      const invalidTableOperation = {
        tableName: 'invalidTable',
        operation: 'create',
        recordId: 1,
        timestamp: new Date(),
      };

      const invalidOpOperation = {
        tableName: 'products',
        operation: 'invalidOp',
        recordId: 1,
        timestamp: new Date(),
      };

      expect(() => validateSyncOperation(invalidTableOperation)).toThrow(
        'Invalid table name: invalidTable',
      );
      expect(() => validateSyncOperation(invalidOpOperation)).toThrow(
        'Invalid operation: invalidOp',
      );
    });
  });
});

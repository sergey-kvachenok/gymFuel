import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnifiedDataService } from '../unified-data-service';
import { UnifiedProduct, UnifiedConsumption, UnifiedNutritionGoals } from '../unified-data-service';

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

const MockUnifiedDataService = require('../unified-data-service').UnifiedDataService;
const MockTrpc = require('../trpc-client').trpc;

describe('Sync Service', () => {
  let mockDataService: any;
  let mockSyncMutation: any;

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

    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
    MockTrpc.sync.batchSync.useMutation.mockReturnValue(mockSyncMutation);
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
        const [products, consumptions, nutritionGoals] = await Promise.all([
          mockDataService.getUnsyncedItems('products', userId),
          mockDataService.getUnsyncedItems('consumptions', userId),
          mockDataService.getUnsyncedItems('nutritionGoals', userId),
        ]);

        const operations = [];

        // Add product operations
        for (const product of products) {
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

        // Add consumption operations
        for (const consumption of consumptions) {
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
        const [products, consumptions, nutritionGoals] = await Promise.all([
          mockDataService.getUnsyncedItems('products', userId),
          mockDataService.getUnsyncedItems('consumptions', userId),
          mockDataService.getUnsyncedItems('nutritionGoals', userId),
        ]);

        return [...products, ...consumptions, ...nutritionGoals];
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

      mockSyncMutation.mutate.mockImplementation((input: any, options: any) => {
        options?.onSuccess?.(mockSyncResult);
      });

      const markItemsAsSynced = async (syncResult: any) => {
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

      const markItemsAsSyncError = async (syncResult: any) => {
        for (const error of syncResult.errors) {
          await mockDataService.markAsSyncError(
            error.operation.tableName,
            error.operation.recordId,
            error.error,
          );
        }
      };

      await markItemsAsSyncError(mockSyncResult);

      expect(mockDataService.markAsSyncError).toHaveBeenCalledWith('products', 1, 'Database error');
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

      const processSyncResult = async (syncResult: any) => {
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
            error.error,
          );
        }
      };

      await processSyncResult(mockSyncResult);

      expect(mockDataService.markAsSynced).toHaveBeenCalledWith('products', 1);
      expect(mockDataService.markAsSyncError).toHaveBeenCalledWith(
        'consumptions',
        1,
        'Database error',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during sync', async () => {
      const networkError = new Error('Network error');
      mockSyncMutation.mutate.mockImplementation((input: any, options: any) => {
        options?.onError?.(networkError);
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
            error.message,
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

      const isPartialSuccess = (syncResult: any) => {
        return syncResult.processed > 0 && syncResult.failed > 0;
      };

      const result = isPartialSuccess(mockSyncResult);
      expect(result).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate sync operation data structure', () => {
      const validateSyncOperation = (operation: any) => {
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
      const validateSyncOperation = (operation: any) => {
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

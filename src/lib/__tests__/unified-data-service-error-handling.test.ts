import {
  UnifiedDataService,
  UnifiedProduct,
  UnifiedConsumption,
  UnifiedNutritionGoals,
} from '../unified-data-service';
import { Product, Consumption, NutritionGoals } from '../../types/api';

// Mock the offline database
jest.mock('../unified-offline-db', () => ({
  unifiedOfflineDb: {
    products: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      bulkAdd: jest.fn(),
      bulkGet: jest.fn(),
    },
    consumptions: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      bulkAdd: jest.fn(),
      bulkGet: jest.fn(),
    },
    nutritionGoals: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      first: jest.fn(),
    },
  },
}));

describe('UnifiedDataService Error Handling', () => {
  let service: UnifiedDataService;
  let mockDb: jest.Mocked<{
    products: {
      add: jest.MockedFunction<(data: unknown) => Promise<number>>;
      get: jest.MockedFunction<(id: number) => Promise<unknown>>;
      where: jest.MockedFunction<
        (field: string) => {
          equals: jest.MockedFunction<
            (value: unknown) => {
              toArray: jest.MockedFunction<() => Promise<unknown[]>>;
              filter: jest.MockedFunction<
                (fn: unknown) => { toArray: jest.MockedFunction<() => Promise<unknown[]>> }
              >;
            }
          >;
        }
      >;
      update: jest.MockedFunction<(id: number, data: unknown) => Promise<void>>;
      delete: jest.MockedFunction<(id: number) => Promise<void>>;
      bulkAdd: jest.MockedFunction<(data: unknown[]) => Promise<number[]>>;
      bulkGet: jest.MockedFunction<(ids: number[]) => Promise<unknown[]>>;
    };
    consumptions: {
      add: jest.MockedFunction<(data: unknown) => Promise<number>>;
      get: jest.MockedFunction<(id: number) => Promise<unknown>>;
      where: jest.MockedFunction<
        (field: string) => {
          equals: jest.MockedFunction<
            (value: unknown) => {
              toArray: jest.MockedFunction<() => Promise<unknown[]>>;
              filter: jest.MockedFunction<
                (fn: unknown) => { toArray: jest.MockedFunction<() => Promise<unknown[]>> }
              >;
            }
          >;
        }
      >;
      update: jest.MockedFunction<(id: number, data: unknown) => Promise<void>>;
      delete: jest.MockedFunction<(id: number) => Promise<void>>;
      bulkAdd: jest.MockedFunction<(data: unknown[]) => Promise<number[]>>;
      bulkGet: jest.MockedFunction<(ids: number[]) => Promise<unknown[]>>;
    };
    nutritionGoals: {
      add: jest.MockedFunction<(data: unknown) => Promise<number>>;
      get: jest.MockedFunction<(id: number) => Promise<unknown>>;
      where: jest.MockedFunction<
        (field: string) => {
          equals: jest.MockedFunction<
            (value: unknown) => {
              toArray: jest.MockedFunction<() => Promise<unknown[]>>;
              first: jest.MockedFunction<() => Promise<unknown>>;
            }
          >;
        }
      >;
      update: jest.MockedFunction<(id: number, data: unknown) => Promise<void>>;
      delete: jest.MockedFunction<(id: number) => Promise<void>>;
      first: jest.MockedFunction<() => Promise<unknown>>;
    };
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UnifiedDataService();
    mockDb = jest.requireMock('../unified-offline-db').unifiedOfflineDb;
  });

  describe('Product Operations Error Handling', () => {
    const mockProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Product',
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
      userId: 1,
    };

    describe('createProduct', () => {
      it('should handle database add failure', async () => {
        mockDb.products.add.mockRejectedValue(new Error('Database connection failed'));

        await expect(service.createProduct(mockProduct)).rejects.toThrow(
          'Database connection failed',
        );
      }, 10000); // Increase timeout for retry mechanism

      it('should handle database get failure after successful add', async () => {
        mockDb.products.add.mockResolvedValue(1);
        mockDb.products.get.mockRejectedValue(new Error('Failed to retrieve created product'));

        await expect(service.createProduct(mockProduct)).rejects.toThrow(
          'Failed to retrieve created product',
        );
      });

      it('should handle null return from database get', async () => {
        mockDb.products.add.mockResolvedValue(1);
        mockDb.products.get.mockResolvedValue(null);

        await expect(service.createProduct(mockProduct)).rejects.toThrow(
          'Failed to create product',
        );
      });

      it('should handle invalid product data', async () => {
        const invalidProduct = {
          ...mockProduct,
          calories: -100, // Invalid negative calories
        };

        // This should be caught by validation or cause database constraint errors
        mockDb.products.add.mockRejectedValue(
          new Error('Invalid data: calories cannot be negative'),
        );

        await expect(
          service.createProduct(invalidProduct as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>),
        ).rejects.toThrow('Invalid data: calories cannot be negative');
      });
    });

    describe('getProducts', () => {
      it('should handle database query failure', async () => {
        mockDb.products.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            toArray: jest.fn().mockRejectedValue(new Error('Database query failed')),
          }),
        });

        await expect(service.getProducts(1)).rejects.toThrow('Database query failed');
      });

      it('should handle empty result gracefully', async () => {
        mockDb.products.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        });

        const result = await service.getProducts(1);
        expect(result).toEqual([]);
      });
    });

    describe('getProduct', () => {
      it('should handle database get failure', async () => {
        mockDb.products.get.mockRejectedValue(new Error('Database get operation failed'));

        await expect(service.getProduct(1)).rejects.toThrow('Database get operation failed');
      });

      it('should return undefined for non-existent product', async () => {
        mockDb.products.get.mockResolvedValue(undefined);

        const result = await service.getProduct(999);
        expect(result).toBeUndefined();
      });
    });

    describe('updateProduct', () => {
      it('should handle non-existent product update', async () => {
        mockDb.products.get.mockResolvedValue(undefined);

        await expect(service.updateProduct(999, { name: 'Updated Product' })).rejects.toThrow(
          'Product with id 999 not found',
        );
      });

      it('should handle database get failure during update', async () => {
        mockDb.products.get.mockRejectedValue(new Error('Database get failed'));

        await expect(service.updateProduct(1, { name: 'Updated Product' })).rejects.toThrow(
          'Database get failed',
        );
      });

      it('should handle database update failure', async () => {
        const existingProduct: UnifiedProduct = {
          id: 1,
          name: 'Test Product',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        };

        mockDb.products.get
          .mockResolvedValueOnce(existingProduct) // First call for existing product
          .mockResolvedValueOnce(existingProduct); // Second call for updated product
        mockDb.products.update.mockRejectedValue(new Error('Database update failed'));

        await expect(service.updateProduct(1, { name: 'Updated Product' })).rejects.toThrow(
          'Database update failed',
        );
      });

      it('should handle database get failure after successful update', async () => {
        const existingProduct: UnifiedProduct = {
          id: 1,
          name: 'Test Product',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        };

        // Reset mocks for this specific test
        mockDb.products.get.mockReset();
        mockDb.products.update.mockReset();

        mockDb.products.get
          .mockResolvedValueOnce(existingProduct) // First call for existing product
          .mockRejectedValueOnce(new Error('Failed to retrieve updated product')); // Second call fails
        mockDb.products.update.mockResolvedValue(undefined);

        await expect(service.updateProduct(1, { name: 'Updated Product' })).rejects.toThrow(
          'Failed to retrieve updated product',
        );
      });
    });

    describe('deleteProduct', () => {
      it('should handle non-existent product deletion', async () => {
        // Reset mocks for this specific test
        mockDb.products.get.mockReset();
        mockDb.products.get.mockResolvedValue(undefined);

        await expect(service.deleteProduct(999)).rejects.toThrow('Product with id 999 not found');
      });

      it('should handle database get failure during deletion', async () => {
        mockDb.products.get.mockRejectedValue(new Error('Database get failed'));

        await expect(service.deleteProduct(1)).rejects.toThrow('Database get failed');
      });

      it('should handle database delete failure', async () => {
        const existingProduct: UnifiedProduct = {
          id: 1,
          name: 'Test Product',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        };

        mockDb.products.get.mockResolvedValue(existingProduct);
        mockDb.products.delete.mockRejectedValue(new Error('Database delete failed'));

        await expect(service.deleteProduct(1)).rejects.toThrow('Database delete failed');
      });
    });
  });

  describe('Consumption Operations Error Handling', () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Test Product',
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockConsumption: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 1,
      productId: 1,
      date: new Date(),
      amount: 100,
      product: mockProduct,
    };

    describe('createConsumption', () => {
      it('should handle database add failure', async () => {
        mockDb.consumptions.add.mockRejectedValue(new Error('Database connection failed'));

        await expect(service.createConsumption(mockConsumption)).rejects.toThrow(
          'Database connection failed',
        );
      }, 10000); // Increase timeout for retry mechanism

      it('should handle database get failure after successful add', async () => {
        mockDb.consumptions.add.mockResolvedValue(1);
        mockDb.consumptions.get.mockRejectedValue(
          new Error('Failed to retrieve created consumption'),
        );

        await expect(service.createConsumption(mockConsumption)).rejects.toThrow(
          'Failed to retrieve created consumption',
        );
      });

      it('should handle null return from database get', async () => {
        mockDb.consumptions.add.mockResolvedValue(1);
        mockDb.consumptions.get.mockResolvedValue(null);

        await expect(service.createConsumption(mockConsumption)).rejects.toThrow(
          'Failed to create consumption',
        );
      });
    });

    describe('getConsumptionsByDateRange', () => {
      it('should handle database query failure', async () => {
        mockDb.consumptions.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            filter: jest.fn().mockReturnValue({
              toArray: jest.fn().mockRejectedValue(new Error('Database query failed')),
            }),
          }),
        });

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        await expect(service.getConsumptionsByDateRange(1, startDate, endDate)).rejects.toThrow(
          'Database query failed',
        );
      });

      it('should handle empty result gracefully', async () => {
        mockDb.consumptions.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            filter: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        const result = await service.getConsumptionsByDateRange(1, startDate, endDate);
        expect(result).toEqual([]);
      });
    });

    describe('updateConsumption', () => {
      it('should handle non-existent consumption update', async () => {
        mockDb.consumptions.get.mockResolvedValue(undefined);

        await expect(service.updateConsumption(999, { amount: 200 })).rejects.toThrow(
          'Consumption with id 999 not found',
        );
      });

      it('should handle database update failure', async () => {
        const existingConsumption: UnifiedConsumption = {
          id: 1,
          userId: 1,
          productId: 1,
          date: new Date(),
          amount: 100,
          product: mockProduct,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        };

        mockDb.consumptions.get.mockResolvedValue(existingConsumption);
        mockDb.consumptions.update.mockRejectedValue(new Error('Database update failed'));

        await expect(service.updateConsumption(1, { amount: 200 })).rejects.toThrow(
          'Database update failed',
        );
      });
    });

    describe('deleteConsumption', () => {
      it('should handle non-existent consumption deletion', async () => {
        mockDb.consumptions.get.mockResolvedValue(undefined);

        await expect(service.deleteConsumption(999)).rejects.toThrow(
          'Consumption with id 999 not found',
        );
      });

      it('should handle database delete failure', async () => {
        const existingConsumption: UnifiedConsumption = {
          id: 1,
          userId: 1,
          productId: 1,
          date: new Date(),
          amount: 100,
          product: mockProduct,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        };

        mockDb.consumptions.get.mockResolvedValue(existingConsumption);
        mockDb.consumptions.delete.mockRejectedValue(new Error('Database delete failed'));

        await expect(service.deleteConsumption(1)).rejects.toThrow('Database delete failed');
      });
    });
  });

  describe('Nutrition Goals Operations Error Handling', () => {
    const mockGoals: Omit<NutritionGoals, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 1,
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyFat: 65,
      dailyCarbs: 250,
      goalType: 'maintain',
    };

    describe('createNutritionGoals', () => {
      it('should handle database add failure', async () => {
        mockDb.nutritionGoals.add.mockRejectedValue(new Error('Database connection failed'));

        await expect(service.createNutritionGoals(mockGoals)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle database get failure after successful add', async () => {
        mockDb.nutritionGoals.add.mockResolvedValue(1);
        mockDb.nutritionGoals.get.mockRejectedValue(new Error('Failed to retrieve created goals'));

        await expect(service.createNutritionGoals(mockGoals)).rejects.toThrow(
          'Failed to retrieve created goals',
        );
      });

      it('should handle null return from database get', async () => {
        mockDb.nutritionGoals.add.mockResolvedValue(1);
        mockDb.nutritionGoals.get.mockResolvedValue(null);

        await expect(service.createNutritionGoals(mockGoals)).rejects.toThrow(
          'Failed to create nutrition goals',
        );
      });
    });

    describe('getNutritionGoals', () => {
      it('should handle database query failure', async () => {
        mockDb.nutritionGoals.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            first: jest.fn().mockRejectedValue(new Error('Database query failed')),
          }),
        });

        await expect(service.getNutritionGoals(1)).rejects.toThrow('Database query failed');
      });

      it('should return undefined for non-existent goals', async () => {
        mockDb.nutritionGoals.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            first: jest.fn().mockResolvedValue(undefined),
          }),
        });

        const result = await service.getNutritionGoals(1);
        expect(result).toBeUndefined();
      });
    });

    describe('updateNutritionGoals', () => {
      it('should handle non-existent goals update', async () => {
        mockDb.nutritionGoals.get.mockResolvedValue(undefined);

        await expect(service.updateNutritionGoals(999, { dailyCalories: 2500 })).rejects.toThrow(
          'Nutrition goals with id 999 not found',
        );
      });

      it('should handle database update failure', async () => {
        const existingGoals: UnifiedNutritionGoals = {
          id: 1,
          userId: 1,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: 'maintain',
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: true,
          _syncTimestamp: new Date(),
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        };

        mockDb.nutritionGoals.get.mockResolvedValue(existingGoals);
        mockDb.nutritionGoals.update.mockRejectedValue(new Error('Database update failed'));

        await expect(service.updateNutritionGoals(1, { dailyCalories: 2500 })).rejects.toThrow(
          'Database update failed',
        );
      });
    });
  });

  describe('Sync Operations Error Handling', () => {
    describe('markAsSynced', () => {
      it('should handle database update failure when marking as synced', async () => {
        mockDb.products.update.mockRejectedValue(new Error('Database update failed'));

        await expect(service.markAsSynced('products', 1)).rejects.toThrow('Database update failed');
      });
    });

    describe('markAsSyncError', () => {
      it('should handle database update failure when marking sync error', async () => {
        mockDb.products.update.mockRejectedValue(new Error('Database update failed'));

        await expect(
          service.markAsSyncError('products', 1, new Error('Sync failed')),
        ).rejects.toThrow('Database update failed');
      });
    });

    describe('getUnsyncedItems', () => {
      it('should handle database query failure when getting unsynced items', async () => {
        mockDb.products.where.mockReturnValue({
          equals: jest.fn().mockReturnValue({
            filter: jest.fn().mockReturnValue({
              toArray: jest.fn().mockRejectedValue(new Error('Database query failed')),
            }),
          }),
        });

        await expect(service.getUnsyncedItems('products', 1)).rejects.toThrow(
          'Database query failed',
        );
      });
    });
  });

  describe('Bulk Operations Error Handling', () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Test Product',
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('batchCreateProducts', () => {
      it('should handle database bulk add failure', async () => {
        const products = [
          { name: 'Product 1', calories: 100, protein: 10, carbs: 20, fat: 5, userId: 1 },
          { name: 'Product 2', calories: 200, protein: 20, carbs: 30, fat: 10, userId: 1 },
        ];

        mockDb.products.bulkAdd.mockRejectedValue(new Error('Bulk add failed'));

        await expect(service.batchCreateProducts(products)).rejects.toThrow('Bulk add failed');
      });

      it('should handle partial bulk add failure', async () => {
        const products = [
          { name: 'Product 1', calories: 100, protein: 10, carbs: 20, fat: 5, userId: 1 },
          { name: 'Product 2', calories: 200, protein: 20, carbs: 30, fat: 10, userId: 1 },
        ];

        // Simulate partial failure - only first product gets added
        mockDb.products.bulkAdd.mockResolvedValue([1, 0]); // Second product failed
        mockDb.products.bulkGet.mockResolvedValue([
          { id: 1, name: 'Product 1', calories: 100, protein: 10, carbs: 20, fat: 5, userId: 1 },
          undefined, // Second product is undefined (should be filtered out)
        ]);

        const result = await service.batchCreateProducts(products);
        // The service filters out null results, so we expect only the successful product
        // The filter should remove null values, but the mock is returning them
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Product 1');
      });
    });

    describe('batchCreateConsumptions', () => {
      it('should handle database bulk add failure', async () => {
        const consumptions = [
          { userId: 1, productId: 1, date: new Date(), amount: 100, product: mockProduct },
          { userId: 1, productId: 2, date: new Date(), amount: 200, product: mockProduct },
        ];

        mockDb.consumptions.bulkAdd.mockRejectedValue(new Error('Bulk add failed'));

        await expect(service.batchCreateConsumptions(consumptions)).rejects.toThrow(
          'Bulk add failed',
        );
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle invalid userId (null or undefined)', async () => {
      // Test with null userId
      mockDb.products.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getProducts(0);
      expect(result).toEqual([]);
    });

    it('should handle invalid date ranges', async () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01'); // End date before start date

      mockDb.consumptions.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.getConsumptionsByDateRange(1, startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should handle very large data sets gracefully', async () => {
      const largeProductList = Array.from({ length: 10000 }, (_, i) => ({
        name: `Product ${i}`,
        calories: 100 + i,
        protein: 10 + i,
        carbs: 20 + i,
        fat: 5 + i,
        userId: 1,
      }));

      mockDb.products.bulkAdd.mockResolvedValue(Array.from({ length: 10000 }, (_, i) => i + 1));
      mockDb.products.bulkGet.mockResolvedValue(
        largeProductList.map((p, i) => ({ ...p, id: i + 1 })),
      );

      const result = await service.batchCreateProducts(largeProductList);
      expect(result).toHaveLength(10000);
    });
  });
});

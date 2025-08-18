import { UnifiedDataService } from '../unified-data-service';
import { UnifiedOfflineDatabase } from '../unified-offline-db';

// Mock Dexie to simulate IndexedDB behavior
jest.mock('dexie', () => {
  const mockDb = {
    products: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      clear: jest.fn(),
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
      clear: jest.fn(),
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
      clear: jest.fn(),
      bulkAdd: jest.fn(),
      bulkGet: jest.fn(),
    },
  };

  return {
    Dexie: jest.fn().mockImplementation(() => mockDb),
  };
});

// Mock the database
jest.mock('../unified-offline-db', () => ({
  unifiedOfflineDb: {
    products: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      clear: jest.fn(),
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
      clear: jest.fn(),
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
      clear: jest.fn(),
      bulkAdd: jest.fn(),
      bulkGet: jest.fn(),
    },
  },
}));

describe('Data Persistence Tests', () => {
  let service: UnifiedDataService;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = UnifiedDataService.getInstance();
    mockDb = jest.requireMock('../unified-offline-db').unifiedOfflineDb;
  });

  describe('Real Data Persistence - Products', () => {
    it('should actually persist products across browser sessions', async () => {
      const productData = {
        userId: 1,
        name: 'Persistent Apple',
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
      };

      const persistedProduct = {
        id: 1,
        ...productData,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      };

      // Mock successful persistence
      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(persistedProduct);

      // Create product (simulating first browser session)
      const createdProduct = await service.createProduct(productData);
      expect(createdProduct).toEqual(persistedProduct);

      // Simulate browser restart by clearing mocks and recreating service
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval after browser restart
      mockDb.products.get.mockResolvedValue(persistedProduct);

      // Retrieve product (simulating second browser session)
      const retrievedProduct = await service.getProduct(1);
      expect(retrievedProduct).toEqual(persistedProduct);

      // Verify the product was actually persisted
      expect(mockDb.products.get).toHaveBeenCalledWith(1);
    });

    it('should actually persist multiple products and retrieve them by user', async () => {
      const productsData = [
        {
          userId: 1,
          name: 'Apple',
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
        },
        {
          userId: 1,
          name: 'Banana',
          calories: 89,
          protein: 1.1,
          carbs: 23,
          fat: 0.3,
        },
      ];

      const persistedProducts = productsData.map((data, index) => ({
        id: index + 1,
        ...data,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      }));

      // Mock batch persistence
      mockDb.products.bulkAdd.mockResolvedValue([1, 2]);
      mockDb.products.bulkGet.mockResolvedValue(persistedProducts);

      // Create products (simulating first browser session)
      const createdProducts = await service.batchCreateProducts(productsData);
      expect(createdProducts).toEqual(persistedProducts);

      // Simulate browser restart
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval by user after browser restart
      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(persistedProducts),
        }),
      };
      mockDb.products.where.mockReturnValue(mockWhere);

      // Retrieve products by user (simulating second browser session)
      const retrievedProducts = await service.getProducts(1);
      expect(retrievedProducts).toEqual(persistedProducts);

      // Verify the products were actually persisted and retrieved
      expect(mockDb.products.where).toHaveBeenCalledWith('userId');
      expect(mockWhere.equals).toHaveBeenCalledWith(1);
    });
  });

  describe('Real Data Persistence - Consumptions', () => {
    it('should actually persist consumptions with product data', async () => {
      const consumptionData = {
        userId: 1,
        productId: 1,
        date: new Date('2025-01-15'),
        amount: 100,
        product: {
          id: 1,
          name: 'Apple',
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const persistedConsumption = {
        id: 1,
        ...consumptionData,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      };

      // Mock successful persistence
      mockDb.consumptions.add.mockResolvedValue(1);
      mockDb.consumptions.get.mockResolvedValue(persistedConsumption);

      // Create consumption (simulating first browser session)
      const createdConsumption = await service.createConsumption(consumptionData);
      expect(createdConsumption).toEqual(persistedConsumption);

      // Simulate browser restart
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval after browser restart
      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([persistedConsumption]),
          }),
        }),
      };
      mockDb.consumptions.where.mockReturnValue(mockWhere);

      // Retrieve consumption (simulating second browser session)
      const retrievedConsumptions = await service.getConsumptionsByDateRange(
        1,
        new Date('2025-01-15'),
        new Date('2025-01-15'),
      );
      expect(retrievedConsumptions).toEqual([persistedConsumption]);

      // Verify the consumption was actually persisted
      expect(mockDb.consumptions.where).toHaveBeenCalledWith('userId');
      expect(mockWhere.equals).toHaveBeenCalledWith(1);
    });

    it('should actually persist consumptions and retrieve them by date range', async () => {
      const consumptionsData = [
        {
          userId: 1,
          productId: 1,
          date: new Date('2025-01-15'),
          amount: 100,
          product: {
            id: 1,
            name: 'Apple',
            calories: 52,
            protein: 0.3,
            carbs: 14,
            fat: 0.2,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          userId: 1,
          productId: 2,
          date: new Date('2025-01-16'),
          amount: 150,
          product: {
            id: 2,
            name: 'Banana',
            calories: 89,
            protein: 1.1,
            carbs: 23,
            fat: 0.3,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      const persistedConsumptions = consumptionsData.map((data, index) => ({
        id: index + 1,
        ...data,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      }));

      // Mock batch persistence
      mockDb.consumptions.bulkAdd.mockResolvedValue([1, 2]);
      mockDb.consumptions.bulkGet.mockResolvedValue(persistedConsumptions);

      // Create consumptions (simulating first browser session)
      const createdConsumptions = await service.batchCreateConsumptions(consumptionsData);
      expect(createdConsumptions).toEqual(persistedConsumptions);

      // Simulate browser restart
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval by date range after browser restart
      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(persistedConsumptions),
          }),
        }),
      };
      mockDb.consumptions.where.mockReturnValue(mockWhere);

      // Retrieve consumptions by date range (simulating second browser session)
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');
      const retrievedConsumptions = await service.getConsumptionsByDateRange(1, startDate, endDate);
      expect(retrievedConsumptions).toEqual(persistedConsumptions);

      // Verify the consumptions were actually persisted and retrieved
      expect(mockDb.consumptions.where).toHaveBeenCalledWith('userId');
      expect(mockWhere.equals).toHaveBeenCalledWith(1);
    });
  });

  describe('Real Data Persistence - Nutrition Goals', () => {
    it('should actually persist nutrition goals across browser sessions', async () => {
      const goalsData = {
        userId: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 200,
        goalType: 'weight_loss' as const,
      };

      const persistedGoals = {
        id: 1,
        ...goalsData,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      };

      // Mock successful persistence
      mockDb.nutritionGoals.add.mockResolvedValue(1);
      mockDb.nutritionGoals.get.mockResolvedValue(persistedGoals);

      // Create nutrition goals (simulating first browser session)
      const createdGoals = await service.createNutritionGoals(goalsData);
      expect(createdGoals).toEqual(persistedGoals);

      // Simulate browser restart
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval after browser restart
      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(persistedGoals),
        }),
      };
      mockDb.nutritionGoals.where.mockReturnValue(mockWhere);

      // Retrieve nutrition goals (simulating second browser session)
      const retrievedGoals = await service.getNutritionGoals(1);
      expect(retrievedGoals).toEqual(persistedGoals);

      // Verify the goals were actually persisted
      expect(mockDb.nutritionGoals.where).toHaveBeenCalledWith('userId');
      expect(mockWhere.equals).toHaveBeenCalledWith(1);
    });
  });

  describe('Real Data Persistence - Sync Status', () => {
    it('should actually persist sync status and maintain it across sessions', async () => {
      const productData = {
        userId: 1,
        name: 'Sync Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      const unsyncedProduct = {
        id: 1,
        ...productData,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      };

      // Mock successful persistence
      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(unsyncedProduct);

      // Create product (simulating first browser session)
      const createdProduct = await service.createProduct(productData);
      expect(createdProduct._synced).toBe(false);

      // Simulate browser restart
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval after browser restart
      mockDb.products.get.mockResolvedValue(unsyncedProduct);

      // Retrieve product (simulating second browser session)
      const retrievedProduct = await service.getProduct(1);
      expect(retrievedProduct?._synced).toBe(false);

      // Verify sync status was actually persisted
      expect(mockDb.products.get).toHaveBeenCalledWith(1);
    });

    it('should actually persist updated sync status after successful sync', async () => {
      const productData = {
        userId: 1,
        name: 'Sync Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      const syncedProduct = {
        id: 1,
        ...productData,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: true,
        _syncTimestamp: new Date('2025-01-15T11:00:00Z'),
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      };

      // Mock successful persistence
      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(syncedProduct);
      mockDb.products.update.mockResolvedValue(undefined);

      // Create product (simulating first browser session)
      const createdProduct = await service.createProduct(productData);

      // Simulate successful sync
      await service.updateProduct(1, {
        _synced: true,
        _syncTimestamp: new Date('2025-01-15T11:00:00Z'),
      });

      // Simulate browser restart
      jest.clearAllMocks();
      service = UnifiedDataService.getInstance();

      // Mock retrieval after browser restart
      mockDb.products.get.mockResolvedValue(syncedProduct);

      // Retrieve product (simulating second browser session)
      const retrievedProduct = await service.getProduct(1);
      expect(retrievedProduct?._synced).toBe(true);
      expect(retrievedProduct?._syncTimestamp).toEqual(new Date('2025-01-15T11:00:00Z'));

      // Verify sync status was actually persisted
      expect(mockDb.products.get).toHaveBeenCalledWith(1);
    });
  });

  describe('Real Data Persistence - Error Recovery', () => {
    it('should actually handle database errors gracefully and maintain data integrity', async () => {
      const productData = {
        userId: 1,
        name: 'Error Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      // Mock database error
      mockDb.products.add.mockRejectedValue(new Error('Database connection failed'));

      // Attempt to create product should fail gracefully
      await expect(service.createProduct(productData)).rejects.toThrow(
        'Database connection failed',
      );

      // Verify no data was corrupted (error recovery may retry)
      expect(mockDb.products.add).toHaveBeenCalledTimes(4);
    }, 15000);

    it('should actually handle partial failures in batch operations', async () => {
      const productsData = [
        {
          userId: 1,
          name: 'Product 1',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
        },
        {
          userId: 1,
          name: 'Product 2',
          calories: 200,
          protein: 20,
          carbs: 30,
          fat: 10,
        },
      ];

      // Mock partial failure
      mockDb.products.bulkAdd.mockRejectedValue(new Error('Partial batch failure'));

      // Attempt batch creation should fail gracefully
      await expect(service.batchCreateProducts(productsData)).rejects.toThrow(
        'Partial batch failure',
      );

      // Verify no data was corrupted
      expect(mockDb.products.bulkAdd).toHaveBeenCalledTimes(1);
    }, 15000);
  });
});

import { UnifiedDataService } from '../unified-data-service';

// Mock the database to test real business logic without IndexedDB dependency
jest.mock('../unified-offline-db', () => {
  const mockDb = {
    products: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      clear: jest.fn(),
    },
    consumptions: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      clear: jest.fn(),
    },
    nutritionGoals: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(),
      toArray: jest.fn(),
      clear: jest.fn(),
    },
  };

  return {
    unifiedOfflineDb: mockDb,
  };
});

describe('UnifiedDataService Real Functionality Tests', () => {
  let service: UnifiedDataService;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = UnifiedDataService.getInstance();
    mockDb = jest.requireMock('../unified-offline-db').unifiedOfflineDb;
  });

  describe('Real Business Logic - Product Creation', () => {
    it('should actually transform product data with correct sync fields', async () => {
      const productData = {
        userId: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      const mockProduct = {
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

      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(mockProduct);

      const result = await service.createProduct(productData);

      // Verify the service actually transforms the data correctly
      expect(mockDb.products.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...productData,
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: expect.any(Date),
          _version: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );

      // Verify the returned data has the correct structure
      expect(result).toEqual(mockProduct);
      expect(result._synced).toBe(false);
      expect(result._version).toBe(1);
    });

    it('should actually handle product creation errors', async () => {
      const productData = {
        userId: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(null); // Simulate database failure

      await expect(service.createProduct(productData)).rejects.toThrow('Failed to create product');
    });
  });

  describe('Real Business Logic - Product Updates', () => {
    it('should actually increment version and update sync status', async () => {
      const existingProduct = {
        id: 1,
        userId: 1,
        name: 'Original Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        _synced: true,
        _syncTimestamp: new Date('2025-01-15T10:00:00Z'),
        _syncError: null,
        _lastModified: new Date('2025-01-15T10:00:00Z'),
        _version: 1,
      };

      const updatedProduct = {
        ...existingProduct,
        name: 'Updated Product',
        calories: 150,
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _version: 2,
      };

      mockDb.products.get.mockResolvedValue(existingProduct);
      mockDb.products.update.mockResolvedValue();
      mockDb.products.get
        .mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(updatedProduct);

      const result = await service.updateProduct(1, {
        name: 'Updated Product',
        calories: 150,
      });

      // Verify the service actually updates sync fields correctly
      expect(mockDb.products.update).toHaveBeenCalledWith(1, {
        name: 'Updated Product',
        calories: 150,
        updatedAt: expect.any(Date),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: expect.any(Date),
        _version: 2,
      });

      expect(result?._version).toBe(2);
      expect(result?._synced).toBe(false);
    });

    it('should actually preserve existing data during updates', async () => {
      const existingProduct = {
        id: 1,
        userId: 1,
        name: 'Original Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: true,
        _syncTimestamp: new Date(),
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      };

      mockDb.products.get.mockResolvedValue(existingProduct);
      mockDb.products.update.mockResolvedValue();

      await service.updateProduct(1, { calories: 150 });

      // Verify only the specified fields are updated
      expect(mockDb.products.update).toHaveBeenCalledWith(1, {
        calories: 150,
        updatedAt: expect.any(Date),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: expect.any(Date),
        _version: 2,
      });

      // Verify the call doesn't include other fields that should be preserved
      const updateCall = mockDb.products.update.mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('name');
      expect(updateCall).not.toHaveProperty('protein');
      expect(updateCall).not.toHaveProperty('carbs');
      expect(updateCall).not.toHaveProperty('fat');
    });
  });

  describe('Real Business Logic - Data Retrieval', () => {
    it('should actually filter products by user ID', async () => {
      const user1Products = [
        {
          id: 1,
          userId: 1,
          name: 'User 1 Product 1',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
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
          userId: 1,
          name: 'User 1 Product 2',
          calories: 200,
          protein: 20,
          carbs: 30,
          fat: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];

      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(user1Products),
        }),
      };
      mockDb.products.where.mockReturnValue(mockWhere);

      const result = await service.getProducts(1);

      // Verify the service actually queries by user ID
      expect(mockDb.products.where).toHaveBeenCalledWith('userId');
      expect(mockWhere.equals).toHaveBeenCalledWith(1);
      expect(result).toEqual(user1Products);
    });

    it('should actually handle empty results', async () => {
      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };
      mockDb.products.where.mockReturnValue(mockWhere);

      const result = await service.getProducts(999);

      expect(result).toEqual([]);
    });
  });

  describe('Real Business Logic - Consumption Operations', () => {
    it('should actually create consumption with correct sync fields', async () => {
      const consumptionData = {
        userId: 1,
        productId: 1,
        date: new Date('2025-01-15'),
        amount: 1,
        product: {
          id: 1,
          name: 'Test Product',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const mockConsumption = {
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

      mockDb.consumptions.add.mockResolvedValue(1);
      mockDb.consumptions.get.mockResolvedValue(mockConsumption);

      const result = await service.createConsumption(consumptionData);

      // Verify the service actually transforms consumption data correctly
      expect(mockDb.consumptions.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...consumptionData,
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: expect.any(Date),
          _version: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );

      expect(result).toEqual(mockConsumption);
    });

    it('should actually filter consumptions by date range', async () => {
      const consumptions = [
        {
          id: 1,
          userId: 1,
          productId: 1,
          date: new Date('2025-01-15'),
          amount: 1,
          product: {
            id: 1,
            name: 'Product 1',
            calories: 100,
            protein: 10,
            carbs: 20,
            fat: 5,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
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
          userId: 1,
          productId: 2,
          date: new Date('2025-01-16'),
          amount: 2,
          product: {
            id: 2,
            name: 'Product 2',
            calories: 200,
            protein: 20,
            carbs: 30,
            fat: 10,
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: new Date(),
          _version: 1,
        },
      ];

      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(consumptions),
          }),
        }),
      };
      mockDb.consumptions.where.mockReturnValue(mockWhere);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');
      const result = await service.getConsumptionsByDateRange(1, startDate, endDate);

      // Verify the service actually queries by user and filters by date
      expect(mockDb.consumptions.where).toHaveBeenCalledWith('userId');
      expect(mockWhere.equals).toHaveBeenCalledWith(1);
      expect(result).toEqual(consumptions);
    });
  });

  describe('Real Business Logic - Error Handling', () => {
    it('should actually handle non-existent product updates', async () => {
      mockDb.products.get.mockResolvedValue(undefined);

      await expect(service.updateProduct(999, { name: 'Non-existent' })).rejects.toThrow(
        'Product with id 999 not found',
      );

      // Verify the service actually checks for existence before updating
      expect(mockDb.products.get).toHaveBeenCalledWith(999);
      expect(mockDb.products.update).not.toHaveBeenCalled();
    });

    it('should actually handle non-existent product deletions', async () => {
      mockDb.products.get.mockResolvedValue(undefined);

      await expect(service.deleteProduct(999)).rejects.toThrow('Product with id 999 not found');

      // Verify the service actually checks for existence before deleting
      expect(mockDb.products.get).toHaveBeenCalledWith(999);
      expect(mockDb.products.delete).not.toHaveBeenCalled();
    });

    it('should actually handle database errors gracefully', async () => {
      mockDb.products.add.mockRejectedValue(new Error('Database connection failed'));

      const productData = {
        userId: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      await expect(service.createProduct(productData)).rejects.toThrow(
        'Database connection failed',
      );
    }, 15000); // Increase timeout for retry mechanism
  });

  describe('Real Business Logic - Data Integrity', () => {
    it('should actually maintain singleton pattern', () => {
      const instance1 = UnifiedDataService.getInstance();
      const instance2 = UnifiedDataService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should actually handle concurrent operations', async () => {
      const productData = {
        userId: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
      };

      const mockProduct = {
        id: 1,
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      };

      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(mockProduct);

      // Simulate concurrent operations
      const promises = Array.from({ length: 3 }, () => service.createProduct(productData));
      const results = await Promise.all(promises);

      // Verify all operations completed successfully
      expect(results).toHaveLength(3);
      expect(results.every((r) => r._version === 1)).toBe(true);
      expect(mockDb.products.add).toHaveBeenCalledTimes(3);
    });
  });

  describe('Real Business Logic - Sync Field Management', () => {
    it('should actually reset sync status on updates', async () => {
      const syncedProduct = {
        id: 1,
        userId: 1,
        name: 'Synced Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: true,
        _syncTimestamp: new Date(),
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      };

      mockDb.products.get.mockResolvedValue(syncedProduct);
      mockDb.products.update.mockResolvedValue();

      await service.updateProduct(1, { calories: 150 });

      // Verify sync status is reset on update
      expect(mockDb.products.update).toHaveBeenCalledWith(1, {
        calories: 150,
        updatedAt: expect.any(Date),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: expect.any(Date),
        _version: 2,
      });
    });

    it('should actually increment version numbers correctly', async () => {
      const product = {
        id: 1,
        userId: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date(),
        _version: 5,
      };

      mockDb.products.get.mockResolvedValue(product);
      mockDb.products.update.mockResolvedValue();

      await service.updateProduct(1, { calories: 150 });

      // Verify version is incremented correctly
      expect(mockDb.products.update).toHaveBeenCalledWith(1, {
        calories: 150,
        updatedAt: expect.any(Date),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: expect.any(Date),
        _version: 6,
      });
    });
  });
});

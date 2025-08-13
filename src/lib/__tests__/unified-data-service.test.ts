import { UnifiedDataService } from '../unified-data-service';
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

describe('UnifiedDataService', () => {
  let service: UnifiedDataService;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UnifiedDataService();
    mockDb = require('../unified-offline-db').unifiedOfflineDb;
  });

  describe('Product Operations', () => {
    const mockProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Product',
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
      userId: 1,
    };

    it('should create a product successfully', async () => {
      const createdProduct: Product = {
        ...mockProduct,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.products.add.mockResolvedValue(1);
      mockDb.products.get.mockResolvedValue(createdProduct);

      const result = await service.createProduct(mockProduct);

      expect(mockDb.products.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockProduct,
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: expect.any(Date),
          _version: 1,
        }),
      );
      expect(result).toEqual(createdProduct);
    });

    it('should get products by user ID', async () => {
      const products: Product[] = [
        { ...mockProduct, id: 1, createdAt: new Date(), updatedAt: new Date() },
        { ...mockProduct, id: 2, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDb.products.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(products),
        }),
      });

      const result = await service.getProducts(1);

      expect(mockDb.products.where).toHaveBeenCalledWith('userId');
      expect(result).toEqual(products);
    });

    it('should update a product successfully', async () => {
      const updates = { name: 'Updated Product' };
      const updatedProduct: Product = {
        ...mockProduct,
        id: 1,
        name: 'Updated Product',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.products.update.mockResolvedValue(undefined);
      mockDb.products.get.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct(1, updates);

      expect(mockDb.products.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          ...updates,
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: expect.any(Date),
          _version: expect.any(Number),
        }),
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should delete a product successfully', async () => {
      const product: Product = {
        ...mockProduct,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.products.get.mockResolvedValue(product);
      mockDb.products.delete.mockResolvedValue(undefined);

      await service.deleteProduct(1);

      expect(mockDb.products.get).toHaveBeenCalledWith(1);
      expect(mockDb.products.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Consumption Operations', () => {
    const mockConsumption: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 1,
      productId: 1,
      quantity: 100,
      date: new Date(),
    };

    it('should create a consumption successfully', async () => {
      const createdConsumption: Consumption = {
        ...mockConsumption,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.consumptions.add.mockResolvedValue(1);
      mockDb.consumptions.get.mockResolvedValue(createdConsumption);

      const result = await service.createConsumption(mockConsumption);

      expect(mockDb.consumptions.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockConsumption,
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: expect.any(Date),
          _version: 1,
        }),
      );
      expect(result).toEqual(createdConsumption);
    });

    it('should get consumptions by date range', async () => {
      const consumptions: Consumption[] = [
        { ...mockConsumption, id: 1, createdAt: new Date(), updatedAt: new Date() },
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockDb.consumptions.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(consumptions),
          }),
        }),
      });

      const result = await service.getConsumptionsByDateRange(1, startDate, endDate);

      expect(mockDb.consumptions.where).toHaveBeenCalledWith('userId');
      expect(result).toEqual(consumptions);
    });
  });

  describe('Nutrition Goals Operations', () => {
    const mockGoals: Omit<NutritionGoals, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 1,
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70,
    };

    it('should create nutrition goals successfully', async () => {
      const createdGoals: NutritionGoals = {
        ...mockGoals,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.nutritionGoals.add.mockResolvedValue(1);
      mockDb.nutritionGoals.get.mockResolvedValue(createdGoals);

      const result = await service.createNutritionGoals(mockGoals);

      expect(mockDb.nutritionGoals.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockGoals,
          _synced: false,
          _syncTimestamp: null,
          _syncError: null,
          _lastModified: expect.any(Date),
          _version: 1,
        }),
      );
      expect(result).toEqual(createdGoals);
    });

    it('should get nutrition goals by user ID', async () => {
      const goals: NutritionGoals = {
        ...mockGoals,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.nutritionGoals.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(goals),
        }),
      });

      const result = await service.getNutritionGoals(1);

      expect(mockDb.nutritionGoals.where).toHaveBeenCalledWith('userId');
      expect(result).toEqual(goals);
    });
  });

  describe('Sync Status Management', () => {
    it('should mark item as synced', async () => {
      const product: Product = {
        id: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      };

      mockDb.products.get.mockResolvedValue(product);
      mockDb.products.update.mockResolvedValue(undefined);

      await service.markAsSynced('products', 1);

      expect(mockDb.products.update).toHaveBeenCalledWith(1, {
        _synced: true,
        _syncTimestamp: expect.any(Date),
        _syncError: null,
      });
    });

    it('should mark item as sync error', async () => {
      const error = new Error('Sync failed');
      mockDb.products.update.mockResolvedValue(undefined);

      await service.markAsSyncError('products', 1, error);

      expect(mockDb.products.update).toHaveBeenCalledWith(1, {
        _synced: false,
        _syncError: error.message,
      });
    });

    it('should get unsynced items', async () => {
      const unsyncedProducts: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5,
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

      mockDb.products.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(unsyncedProducts),
          }),
        }),
      });

      const result = await service.getUnsyncedItems('products', 1);

      expect(mockDb.products.where).toHaveBeenCalledWith('userId');
      expect(result).toEqual(unsyncedProducts);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts using last write wins', async () => {
      const localItem = {
        id: 1,
        name: 'Local Product',
        _lastModified: new Date('2024-01-01T10:00:00Z'),
        _version: 1,
      };

      const serverItem = {
        id: 1,
        name: 'Server Product',
        _lastModified: new Date('2024-01-01T11:00:00Z'),
        _version: 2,
      };

      const result = service.resolveConflict(localItem, serverItem);

      expect(result).toEqual(serverItem); // Server item wins due to later timestamp
    });

    it('should use local item when it has later timestamp', async () => {
      const localItem = {
        id: 1,
        name: 'Local Product',
        _lastModified: new Date('2024-01-01T11:00:00Z'),
        _version: 2,
      };

      const serverItem = {
        id: 1,
        name: 'Server Product',
        _lastModified: new Date('2024-01-01T10:00:00Z'),
        _version: 1,
      };

      const result = service.resolveConflict(localItem, serverItem);

      expect(result).toEqual(localItem); // Local item wins due to later timestamp
    });
  });

  describe('Batch Operations', () => {
    it('should batch create multiple products', async () => {
      const productsData = [
        { name: 'Product 1', calories: 100, protein: 10, carbs: 20, fat: 5, userId: 1 },
        { name: 'Product 2', calories: 200, protein: 20, carbs: 30, fat: 10, userId: 1 },
      ];

      const createdProducts = [
        { ...productsData[0], id: 1, createdAt: new Date(), updatedAt: new Date() },
        { ...productsData[1], id: 2, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDb.products.bulkAdd.mockResolvedValue([1, 2]);
      mockDb.products.bulkGet.mockResolvedValue(createdProducts);

      const result = await service.batchCreateProducts(productsData);

      expect(mockDb.products.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            ...productsData[0],
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: expect.any(Date),
            _version: 1,
          }),
          expect.objectContaining({
            ...productsData[1],
            _synced: false,
            _syncTimestamp: null,
            _syncError: null,
            _lastModified: expect.any(Date),
            _version: 1,
          }),
        ]),
      );
      expect(result).toEqual(createdProducts);
    });

    it('should batch update multiple products', async () => {
      const updates = [
        { id: 1, updates: { name: 'Updated Product 1' } },
        { id: 2, updates: { name: 'Updated Product 2' } },
      ];

      const existingProducts = [
        { id: 1, name: 'Product 1', _version: 1 },
        { id: 2, name: 'Product 2', _version: 1 },
      ];

      const updatedProducts = [
        { ...existingProducts[0], name: 'Updated Product 1', _version: 2 },
        { ...existingProducts[1], name: 'Updated Product 2', _version: 2 },
      ];

      mockDb.products.get
        .mockResolvedValueOnce(existingProducts[0])
        .mockResolvedValueOnce(existingProducts[1]);
      mockDb.products.update.mockResolvedValue(undefined);
      mockDb.products.get
        .mockResolvedValueOnce(updatedProducts[0])
        .mockResolvedValueOnce(updatedProducts[1]);

      const result = await service.batchUpdateProducts(updates);

      expect(mockDb.products.update).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedProducts);
    });

    it('should get all unsynced items across all tables', async () => {
      const unsyncedProducts = [{ id: 1, name: 'Product 1', _synced: false }];
      const unsyncedConsumptions = [{ id: 1, productId: 1, _synced: false }];
      const unsyncedGoals = [{ id: 1, userId: 1, _synced: false }];

      mockDb.products.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(unsyncedProducts),
          }),
        }),
      });

      mockDb.consumptions.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(unsyncedConsumptions),
          }),
        }),
      });

      mockDb.nutritionGoals.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(unsyncedGoals),
          }),
        }),
      });

      const result = await service.getAllUnsyncedItems(1);

      expect(result).toEqual({
        products: unsyncedProducts,
        consumptions: unsyncedConsumptions,
        nutritionGoals: unsyncedGoals,
      });
    });
  });
});

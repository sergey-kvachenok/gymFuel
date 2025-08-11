import { OfflineDataService } from '../offline-data-service';
import { offlineDb } from '../offline-db';

// Mock the offline database
jest.mock('../offline-db', () => ({
  offlineDb: {
    syncQueue: {
      add: jest.fn(),
    },
    products: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          toArray: jest.fn(() => []),
        })),
      })),
    },
    consumptions: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          and: jest.fn(() => ({
            toArray: jest.fn(() => []),
          })),
        })),
      })),
    },
    nutritionGoals: {
      put: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          first: jest.fn(() => null),
        })),
      })),
    },
  },
}));

describe('OfflineDataService', () => {
  let service: OfflineDataService;

  beforeEach(() => {
    service = new OfflineDataService();
    jest.clearAllMocks();
  });

  describe('User ID Validation', () => {
    test('should throw error when userId is undefined in sync queue operations', async () => {
      // Test that the service properly validates userId
      await expect(
        service['addToSyncQueue']('products', 'create', 1, {}, undefined),
      ).rejects.toThrow('userId is required for sync queue operations');
    });

    test('should throw error when userId is null in sync queue operations', async () => {
      await expect(service['addToSyncQueue']('products', 'create', 1, {}, null)).rejects.toThrow(
        'userId is required for sync queue operations',
      );
    });

    test('should throw error when userId is 0 in sync queue operations', async () => {
      await expect(service['addToSyncQueue']('products', 'create', 1, {}, 0)).rejects.toThrow(
        'userId is required for sync queue operations',
      );
    });

    test('should accept valid userId in sync queue operations', async () => {
      const mockAdd = offlineDb.syncQueue.add as jest.Mock;
      mockAdd.mockResolvedValue(1);

      await expect(
        service['addToSyncQueue']('products', 'create', 1, {}, 123),
      ).resolves.not.toThrow();

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 123,
        }),
      );
    });
  });

  describe('Product Operations', () => {
    test('should create product with valid userId', async () => {
      const mockAdd = offlineDb.products.add as jest.Mock;
      const mockGet = offlineDb.products.get as jest.Mock;
      const mockSyncAdd = offlineDb.syncQueue.add as jest.Mock;

      mockAdd.mockResolvedValue(1);
      mockGet.mockResolvedValue({ id: 1, name: 'Test Product', userId: 123 });
      mockSyncAdd.mockResolvedValue(1);

      const result = await service.createProduct({
        name: 'Test Product',
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 15,
        userId: 123,
      });

      expect(result).toBeDefined();
      expect(mockSyncAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 123,
        }),
      );
    });
  });

  describe('Consumption Operations', () => {
    test('should create consumption with valid userId', async () => {
      const mockAdd = offlineDb.consumptions.add as jest.Mock;
      const mockGet = offlineDb.consumptions.get as jest.Mock;
      const mockSyncAdd = offlineDb.syncQueue.add as jest.Mock;

      mockAdd.mockResolvedValue(1);
      mockGet.mockResolvedValue({
        id: 1,
        productId: 1,
        amount: 100,
        date: new Date(),
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSyncAdd.mockResolvedValue(1);

      const result = await service.createConsumption({
        productId: 1,
        amount: 100,
        date: new Date(),
        userId: 123,
      });

      expect(result).toBeDefined();
      expect(mockSyncAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 123,
        }),
      );
    });
  });

  describe('Nutrition Goals Operations', () => {
    test('should upsert nutrition goals with valid userId', async () => {
      const mockPut = offlineDb.nutritionGoals.put as jest.Mock;
      const mockGet = offlineDb.nutritionGoals.get as jest.Mock;
      const mockSyncAdd = offlineDb.syncQueue.add as jest.Mock;

      mockPut.mockResolvedValue(1);
      mockGet.mockResolvedValue({
        id: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: 'maintain',
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSyncAdd.mockResolvedValue(1);

      const result = await service.upsertNutritionGoals({
        id: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: 'maintain',
        userId: 123,
      });

      expect(result).toBeDefined();
      expect(mockSyncAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 123,
        }),
      );
    });
  });
});

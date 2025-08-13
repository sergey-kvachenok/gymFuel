import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock tRPC before importing sync router
jest.mock('../../trpc', () => ({
  router: jest.fn(() => ({
    createCaller: jest.fn(),
  })),
  protectedProcedure: {
    input: jest.fn(() => ({
      mutation: jest.fn(),
      query: jest.fn(),
    })),
    query: jest.fn(() => ({
      query: jest.fn(),
    })),
  },
}));

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    consumption: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    nutritionGoals: {
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock unified data service
jest.mock('../../unified-data-service', () => ({
  UnifiedProduct: {},
  UnifiedConsumption: {},
  UnifiedNutritionGoals: {},
}));

// Import after mocks
import { syncRouter } from '../sync';
import { prisma } from '../../prisma';

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    consumption: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    nutritionGoals: {
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock tRPC context
const mockContext = {
  session: {
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    },
  },
};

describe('Sync Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('batchSync', () => {
    it('should process product create operations successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 20,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              name: 'Test Product',
              calories: 100,
              protein: 10,
              fat: 5,
              carbs: 20,
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          userId: 1,
          id: 1,
        },
      });
    });

    it('should process product update operations successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Updated Product',
        calories: 150,
        protein: 15,
        fat: 8,
        carbs: 25,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.update as jest.Mock).mockResolvedValue(mockProduct);

      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'update' as const,
            recordId: 1,
            data: {
              name: 'Updated Product',
              calories: 150,
              protein: 15,
              fat: 8,
              carbs: 25,
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        data: {
          name: 'Updated Product',
          calories: 150,
          protein: 15,
          fat: 8,
          carbs: 25,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should process product delete operations successfully', async () => {
      (prisma.product.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'delete' as const,
            recordId: 1,
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
    });

    it('should process consumption create operations successfully', async () => {
      const mockConsumption = {
        id: 1,
        productId: 1,
        amount: 100,
        date: new Date(),
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.consumption.create as jest.Mock).mockResolvedValue(mockConsumption);

      const input = {
        operations: [
          {
            tableName: 'consumptions' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              productId: 1,
              amount: 100,
              date: new Date(),
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(prisma.consumption.create).toHaveBeenCalledWith({
        data: {
          productId: 1,
          amount: 100,
          date: expect.any(Date),
          userId: 1,
          id: 1,
        },
      });
    });

    it('should process nutrition goals create operations successfully', async () => {
      const mockGoals = {
        id: 1,
        userId: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: 'maintain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.nutritionGoals.create as jest.Mock).mockResolvedValue(mockGoals);

      const input = {
        operations: [
          {
            tableName: 'nutritionGoals' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              dailyCalories: 2000,
              dailyProtein: 150,
              dailyFat: 65,
              dailyCarbs: 250,
              goalType: 'maintain',
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(prisma.nutritionGoals.create).toHaveBeenCalledWith({
        data: {
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: 'maintain',
          userId: 1,
          id: 1,
        },
      });
    });

    it('should process nutrition goals update operations using upsert', async () => {
      const mockGoals = {
        id: 1,
        userId: 1,
        dailyCalories: 2200,
        dailyProtein: 165,
        dailyFat: 73,
        dailyCarbs: 275,
        goalType: 'lose',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.nutritionGoals.upsert as jest.Mock).mockResolvedValue(mockGoals);

      const input = {
        operations: [
          {
            tableName: 'nutritionGoals' as const,
            operation: 'update' as const,
            recordId: 1,
            data: {
              dailyCalories: 2200,
              dailyProtein: 165,
              dailyFat: 73,
              dailyCarbs: 275,
              goalType: 'lose',
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(prisma.nutritionGoals.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        create: {
          dailyCalories: 2200,
          dailyProtein: 165,
          dailyFat: 73,
          dailyCarbs: 275,
          goalType: 'lose',
          userId: 1,
        },
        update: {
          dailyCalories: 2200,
          dailyProtein: 165,
          dailyFat: 73,
          dailyCarbs: 275,
          goalType: 'lose',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle multiple operations in a single batch', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      const mockConsumption = { id: 1, productId: 1, amount: 100 };

      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.consumption.create as jest.Mock).mockResolvedValue(mockConsumption);

      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              name: 'Test Product',
              calories: 100,
              protein: 10,
              fat: 5,
              carbs: 20,
            },
            timestamp: new Date(),
          },
          {
            tableName: 'consumptions' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              productId: 1,
              amount: 100,
              date: new Date(),
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
    });

    it('should handle partial failures in batch operations', async () => {
      (prisma.product.create as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.consumption.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              name: 'Test Product',
              calories: 100,
              protein: 10,
              fat: 5,
              carbs: 20,
            },
            timestamp: new Date(),
          },
          {
            tableName: 'consumptions' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              productId: 1,
              amount: 100,
              date: new Date(),
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(result.errors[0].error).toBe('Database error');
    });

    it('should throw error for unauthenticated users', async () => {
      const unauthenticatedContext = {
        session: null,
      };

      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'create' as const,
            recordId: 1,
            data: {
              name: 'Test Product',
              calories: 100,
              protein: 10,
              fat: 5,
              carbs: 20,
            },
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(unauthenticatedContext);

      await expect(caller.batchSync(input)).rejects.toThrow('User not authenticated');
    });

    it('should throw error for unknown table names', async () => {
      const input = {
        operations: [
          {
            tableName: 'unknownTable' as any,
            operation: 'create' as const,
            recordId: 1,
            data: {},
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toBe('Unknown table name: unknownTable');
    });

    it('should throw error for missing data in create operations', async () => {
      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'create' as const,
            recordId: 1,
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toBe('Data required for create operation');
    });

    it('should throw error for missing data in update operations', async () => {
      const input = {
        operations: [
          {
            tableName: 'products' as const,
            operation: 'update' as const,
            recordId: 1,
            timestamp: new Date(),
          },
        ],
      };

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.batchSync(input);

      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toBe('Data required for update operation');
    });
  });

  describe('getStatus', () => {
    it('should return sync status with counts', async () => {
      (prisma.product.count as jest.Mock).mockResolvedValue(5);
      (prisma.consumption.count as jest.Mock).mockResolvedValue(10);
      (prisma.nutritionGoals.count as jest.Mock).mockResolvedValue(1);

      const caller = syncRouter.createCaller(mockContext);
      const result = await caller.getStatus();

      expect(result.userId).toBe(1);
      expect(result.counts).toEqual({
        products: 5,
        consumptions: 10,
        nutritionGoals: 1,
      });
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should throw error for unauthenticated users', async () => {
      const unauthenticatedContext = {
        session: null,
      };

      const caller = syncRouter.createCaller(unauthenticatedContext);

      await expect(caller.getStatus()).rejects.toThrow('User not authenticated');
    });
  });
});

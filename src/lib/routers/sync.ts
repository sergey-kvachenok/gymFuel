import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '../prisma';

/**
 * User type with id property
 */
interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Zod schemas for data validation
 */
const ProductDataSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

const ConsumptionDataSchema = z.object({
  productId: z.number(),
  amount: z.number(),
  date: z.date(),
});

const NutritionGoalsDataSchema = z.object({
  dailyCalories: z.number(),
  dailyProtein: z.number(),
  dailyFat: z.number(),
  dailyCarbs: z.number(),
  goalType: z.string(),
});

/**
 * Schema for sync queue operations
 */
const SyncOperationSchema = z.object({
  tableName: z.enum(['products', 'consumptions', 'nutritionGoals']),
  operation: z.enum(['create', 'update', 'delete']),
  recordId: z.number(),
  data: z.union([ProductDataSchema, ConsumptionDataSchema, NutritionGoalsDataSchema]).optional(),
  timestamp: z.date(),
});

const BatchSyncInputSchema = z.object({
  operations: z.array(SyncOperationSchema),
});

/**
 * Sync router for handling offline synchronization
 */
export const syncRouter = router({
  /**
   * Batch sync endpoint that processes multiple operations
   * Handles create, update, delete operations for products, consumptions, and nutrition goals
   */
  batchSync: protectedProcedure.input(BatchSyncInputSchema).mutation(async ({ ctx, input }) => {
    const { session } = ctx;
    const userId = parseInt((session?.user as AuthenticatedUser)?.id);

    if (!userId || isNaN(userId)) {
      throw new Error('User not authenticated or invalid user ID');
    }

    console.log(
      `Processing batch sync for user ${userId} with ${input.operations.length} operations`,
    );

    const results = [];
    const errors = [];

    // Process each operation in the batch
    for (const operation of input.operations) {
      try {
        const result = await processSyncOperation(operation, userId);
        results.push({
          operation,
          success: true,
          result,
        });
      } catch (error) {
        console.error(`Failed to process sync operation:`, operation, error);
        errors.push({
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      processed: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }),

  /**
   * Get sync status - useful for debugging
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    const userId = parseInt((session?.user as AuthenticatedUser)?.id);

    if (!userId || isNaN(userId)) {
      throw new Error('User not authenticated or invalid user ID');
    }

    // Get counts of each entity type for verification
    const [productCount, consumptionCount, nutritionGoalsCount] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.consumption.count({ where: { userId } }),
      prisma.nutritionGoals.count({ where: { userId } }),
    ]);

    return {
      userId,
      counts: {
        products: productCount,
        consumptions: consumptionCount,
        nutritionGoals: nutritionGoalsCount,
      },
      timestamp: new Date(),
    };
  }),
});

/**
 * Process a single sync operation
 */
const processSyncOperation = async (
  operation: z.infer<typeof SyncOperationSchema>,
  userId: number,
) => {
  const { tableName, operation: op, recordId, data } = operation;

  switch (tableName) {
    case 'products':
      return await processProductOperation(
        op,
        recordId,
        data as z.infer<typeof ProductDataSchema>,
        userId,
      );
    case 'consumptions':
      return await processConsumptionOperation(
        op,
        recordId,
        data as z.infer<typeof ConsumptionDataSchema>,
        userId,
      );
    case 'nutritionGoals':
      return await processNutritionGoalsOperation(
        op,
        recordId,
        data as z.infer<typeof NutritionGoalsDataSchema>,
        userId,
      );
    default:
      throw new Error(`Unknown table name: ${tableName}`);
  }
};

/**
 * Process product operations
 */
const processProductOperation = async (
  operation: string,
  recordId: number,
  data: z.infer<typeof ProductDataSchema> | undefined,
  userId: number,
) => {
  switch (operation) {
    case 'create':
      if (!data) throw new Error('Data required for create operation');
      return await prisma.product.create({
        data: {
          ...data,
          userId,
        },
      });

    case 'update':
      if (!data) throw new Error('Data required for update operation');
      return await prisma.product.update({
        where: { id: recordId, userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

    case 'delete':
      return await prisma.product.delete({
        where: { id: recordId, userId },
      });

    default:
      throw new Error(`Unknown product operation: ${operation}`);
  }
};

/**
 * Process consumption operations
 */
const processConsumptionOperation = async (
  operation: string,
  recordId: number,
  data: z.infer<typeof ConsumptionDataSchema> | undefined,
  userId: number,
) => {
  switch (operation) {
    case 'create':
      if (!data) throw new Error('Data required for create operation');
      return await prisma.consumption.create({
        data: {
          ...data,
          userId,
        },
      });

    case 'update':
      if (!data) throw new Error('Data required for update operation');
      return await prisma.consumption.update({
        where: { id: recordId, userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

    case 'delete':
      return await prisma.consumption.delete({
        where: { id: recordId, userId },
      });

    default:
      throw new Error(`Unknown consumption operation: ${operation}`);
  }
};

/**
 * Process nutrition goals operations
 */
const processNutritionGoalsOperation = async (
  operation: string,
  recordId: number,
  data: z.infer<typeof NutritionGoalsDataSchema> | undefined,
  userId: number,
) => {
  switch (operation) {
    case 'create':
      if (!data) throw new Error('Data required for create operation');
      return await prisma.nutritionGoals.create({
        data: {
          ...data,
          userId,
        },
      });

    case 'update':
      if (!data) throw new Error('Data required for update operation');
      return await prisma.nutritionGoals.upsert({
        where: { userId },
        create: {
          ...data,
          userId,
        },
        update: {
          ...data,
          updatedAt: new Date(),
        },
      });

    case 'delete':
      return await prisma.nutritionGoals.delete({
        where: { id: recordId, userId },
      });

    default:
      throw new Error(`Unknown nutrition goals operation: ${operation}`);
  }
};

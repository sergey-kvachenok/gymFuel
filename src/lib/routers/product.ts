import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { Prisma } from '@prisma/client';

export const productRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Product name is required'),
        calories: z.number().min(0, 'Calories must be non-negative'),
        protein: z.number().min(0, 'Protein must be non-negative'),
        fat: z.number().min(0, 'Fat must be non-negative'),
        carbs: z.number().min(0, 'Carbs must be non-negative'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      return await ctx.prisma.product.create({
        data: {
          userId,
          name: input.name,
          calories: input.calories,
          protein: input.protein,
          fat: input.fat,
          carbs: input.carbs,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, 'Product name is required'),
        calories: z.number().min(0, 'Calories must be non-negative'),
        protein: z.number().min(0, 'Protein must be non-negative'),
        fat: z.number().min(0, 'Fat must be non-negative'),
        carbs: z.number().min(0, 'Carbs must be non-negative'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      const existing = await ctx.prisma.product.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new Error('Product not found or access denied');
      }

      return await ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          calories: input.calories,
          protein: input.protein,
          fat: input.fat,
          carbs: input.carbs,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      const existing = await ctx.prisma.product.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new Error('Product not found or access denied');
      }

      // Проверяем нет ли связанных потреблений
      const consumptionsCount = await ctx.prisma.consumption.count({
        where: { productId: input.id },
      });

      if (consumptionsCount > 0) {
        throw new Error(
          'Cannot delete product that has consumption records. Delete consumption records first.',
        );
      }

      return await ctx.prisma.product.delete({
        where: { id: input.id },
      });
    }),

  getAll: protectedProcedure
    .input(
      z
        .object({
          query: z.string().optional(),
          limit: z.number().min(1).max(1000).default(100),
          orderBy: z.enum(['name', 'createdAt']).default('createdAt'),
          orderDirection: z.enum(['asc', 'desc']).default('desc'),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      const where = {
        userId,
        ...(input?.query
          ? { name: { contains: input.query, mode: Prisma.QueryMode.insensitive } }
          : {}),
      };

      const orderBy = {
        [input?.orderBy || 'createdAt']: input?.orderDirection || 'desc',
      };

      return await ctx.prisma.product.findMany({
        where,
        orderBy,
        take: input?.limit || 100,
      });
    }),
});

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const consumptionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        amount: z.number().min(0.1, 'Amount must be positive'),
        date: z.string().optional(), // YYYY-MM-DD format, defaults to today
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      const date = input.date ? new Date(input.date) : new Date();

      return await ctx.prisma.consumption.create({
        data: {
          userId,
          productId: input.productId,
          amount: input.amount,
          date,
        },
        include: {
          product: true,
        },
      });
    }),

  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(), // YYYY-MM-DD format, defaults to today
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      const targetDate = input.date ? new Date(input.date) : new Date();

      // Set time to start and end of day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return await ctx.prisma.consumption.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  getDailyStats: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(), // YYYY-MM-DD format, defaults to today
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      const targetDate = input.date ? new Date(input.date) : new Date();

      // Set time to start and end of day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const consumptions = await ctx.prisma.consumption.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          product: true,
        },
      });

      // Calculate totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;

      consumptions.forEach((consumption) => {
        const ratio = consumption.amount / 100; // convert to per-gram ratio
        totalCalories += consumption.product.calories * ratio;
        totalProtein += consumption.product.protein * ratio;
        totalFat += consumption.product.fat * ratio;
        totalCarbs += consumption.product.carbs * ratio;
      });

      return {
        date: targetDate.toISOString().split('T')[0],
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        consumptionsCount: consumptions.length,
      };
    }),
});

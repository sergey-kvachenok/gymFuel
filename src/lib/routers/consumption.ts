import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const consumptionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        amount: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      return await ctx.prisma.consumption.create({
        data: {
          userId,
          productId: input.productId,
          amount: input.amount,
          date: new Date(),
        },
        include: {
          product: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        amount: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      // Проверяем что запись принадлежит пользователю
      const existing = await ctx.prisma.consumption.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new Error('Consumption record not found or access denied');
      }

      return await ctx.prisma.consumption.update({
        where: { id: input.id },
        data: { amount: input.amount },
        include: {
          product: true,
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

      // Проверяем что запись принадлежит пользователю
      const existing = await ctx.prisma.consumption.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new Error('Consumption record not found or access denied');
      }

      return await ctx.prisma.consumption.delete({
        where: { id: input.id },
      });
    }),

  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      const targetDate = input.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return await ctx.prisma.consumption.findMany({
        where: {
          userId,
          createdAt: {
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
        date: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      const targetDate = input.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const consumptions = await ctx.prisma.consumption.findMany({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          product: true,
        },
      });

      const stats = consumptions.reduce(
        (acc, consumption) => {
          const ratio = consumption.amount / 100;
          acc.totalCalories += consumption.product.calories * ratio;
          acc.totalProtein += consumption.product.protein * ratio;
          acc.totalFat += consumption.product.fat * ratio;
          acc.totalCarbs += consumption.product.carbs * ratio;
          acc.consumptionsCount += 1;
          return acc;
        },
        {
          date: targetDate.toISOString().split('T')[0],
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          consumptionsCount: 0,
        },
      );

      return stats;
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30), // Последние N дней
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      startDate.setHours(0, 0, 0, 0);

      const consumptions = await ctx.prisma.consumption.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Группируем по дням
      const groupedByDate: Record<string, typeof consumptions> = {};

      consumptions.forEach((consumption) => {
        const date = consumption.createdAt.toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(consumption);
      });

      // Создаём массив с дневной статистикой
      const history = Object.entries(groupedByDate).map(([date, dayConsumptions]) => {
        const stats = dayConsumptions.reduce(
          (acc, consumption) => {
            const ratio = consumption.amount / 100;
            acc.totalCalories += consumption.product.calories * ratio;
            acc.totalProtein += consumption.product.protein * ratio;
            acc.totalFat += consumption.product.fat * ratio;
            acc.totalCarbs += consumption.product.carbs * ratio;
            acc.consumptionsCount += 1;
            return acc;
          },
          {
            date,
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            consumptionsCount: 0,
            consumptions: dayConsumptions,
          },
        );

        return stats;
      });

      // Сортируем по убыванию даты
      return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }),
});

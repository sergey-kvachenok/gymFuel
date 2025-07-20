import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const goalsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt((ctx.session!.user as { id: string }).id);

    return await ctx.prisma.nutritionGoals.findUnique({
      where: { userId },
    });
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        dailyCalories: z
          .number()
          .min(500, 'Calories must be at least 500')
          .max(10000, 'Calories too high'),
        dailyProtein: z
          .number()
          .min(10, 'Protein must be at least 10g')
          .max(500, 'Protein too high'),
        dailyFat: z.number().min(10, 'Fat must be at least 10g').max(300, 'Fat too high'),
        dailyCarbs: z.number().min(10, 'Carbs must be at least 10g').max(1000, 'Carbs too high'),
        goalType: z.enum(['gain', 'lose', 'maintain']).default('maintain'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);

      return await ctx.prisma.nutritionGoals.upsert({
        where: { userId },
        update: {
          dailyCalories: input.dailyCalories,
          dailyProtein: input.dailyProtein,
          dailyFat: input.dailyFat,
          dailyCarbs: input.dailyCarbs,
          goalType: input.goalType,
        },
        create: {
          userId,
          dailyCalories: input.dailyCalories,
          dailyProtein: input.dailyProtein,
          dailyFat: input.dailyFat,
          dailyCarbs: input.dailyCarbs,
          goalType: input.goalType,
        },
      });
    }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = parseInt((ctx.session!.user as { id: string }).id);

    const existing = await ctx.prisma.nutritionGoals.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new Error('No goals found to delete');
    }

    return await ctx.prisma.nutritionGoals.delete({
      where: { userId },
    });
  }),

  getRecommendations: protectedProcedure
    .input(
      z.object({
        weight: z.number().min(30).max(300).optional(),
        height: z.number().min(100).max(250).optional(),
        age: z.number().min(10).max(120).optional(),
        gender: z.enum(['male', 'female']).optional(),
        activityLevel: z
          .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
          .optional(),
        goalType: z.enum(['gain', 'lose', 'maintain']),
      }),
    )
    .query(async ({ input }) => {
      // Базовые рекомендации на основе целей
      const baseRecommendations = {
        gain: {
          dailyCalories: 2800,
          dailyProtein: 140, // 2g/kg для 70kg
          dailyFat: 93, // 30% от калорий
          dailyCarbs: 350, // остальное
        },
        lose: {
          dailyCalories: 1800,
          dailyProtein: 140,
          dailyFat: 60,
          dailyCarbs: 180,
        },
        maintain: {
          dailyCalories: 2200,
          dailyProtein: 110,
          dailyFat: 73,
          dailyCarbs: 275,
        },
      };

      // Возвращаем базовые рекомендации (можно расширить формулами BMR в будущем)
      return {
        ...baseRecommendations[input.goalType],
        goalType: input.goalType,
        description: {
          gain: 'Muscle gain: Higher calories and protein for building mass',
          lose: 'Fat loss: Caloric deficit while maintaining protein',
          maintain: 'Maintenance: Balanced nutrition for current weight',
        }[input.goalType],
      };
    }),
});

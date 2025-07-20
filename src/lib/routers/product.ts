import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const productRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt((ctx.session!.user as { id: string }).id);
    return await ctx.prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        calories: z.number().min(0, 'Calories must be positive'),
        protein: z.number().min(0, 'Protein must be positive'),
        fat: z.number().min(0, 'Fat must be positive'),
        carbs: z.number().min(0, 'Carbs must be positive'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = parseInt((ctx.session!.user as { id: string }).id);
      return await ctx.prisma.product.create({
        data: {
          ...input,
          userId,
        },
      });
    }),
});

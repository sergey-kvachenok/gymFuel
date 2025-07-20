import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export const createContext = async () => {
  const session = await getServerSession(authOptions);
  return { session, prisma };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) throw new Error('UNAUTHORIZED');
  return next({ ctx });
});

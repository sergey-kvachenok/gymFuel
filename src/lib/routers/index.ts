import { router } from '../trpc';
import { productRouter } from './product';
import { consumptionRouter } from './consumption';
import { goalsRouter } from './goals';

export const appRouter = router({
  product: productRouter,
  consumption: consumptionRouter,
  goals: goalsRouter,
});

export type AppRouter = typeof appRouter;

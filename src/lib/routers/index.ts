import { router } from '../trpc';
import { productRouter } from './product';
import { consumptionRouter } from './consumption';
import { goalsRouter } from './goals';
import { syncRouter } from './sync';

export const appRouter = router({
  product: productRouter,
  consumption: consumptionRouter,
  goals: goalsRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;

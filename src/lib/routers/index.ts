import { router } from '../trpc';
import { productRouter } from './product';
import { consumptionRouter } from './consumption';

export const appRouter = router({
  product: productRouter,
  consumption: consumptionRouter,
});

export type AppRouter = typeof appRouter;

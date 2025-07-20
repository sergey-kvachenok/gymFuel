import { appRouter } from './routers';
import { createContext } from './trpc';

export const createTrpcServer = async () => {
  const context = await createContext();
  return appRouter.createCaller(context);
};

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../../lib/routers';
import { createContext } from '../../../../lib/trpc';

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  });
};

export { handler as GET, handler as POST };

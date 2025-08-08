'use client';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { trpc } from '../lib/trpc-client';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { registerServiceWorker } from '../lib/pwa/register';
import { useOfflineInit } from '../hooks/use-offline-init';

function OfflineInitializer({ children }: { children: React.ReactNode }) {
  useOfflineInit();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    }),
  );

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <OfflineInitializer>
            {children}
          </OfflineInitializer>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../lib/trpc-client';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { useServiceWorker } from '../hooks/use-service-worker';
import { BackgroundSyncManager } from '../lib/background-sync-manager';
import { UnifiedDataService } from '../lib/unified-data-service';
import { ConnectionMonitor } from '../lib/connection-monitor';
import { syncErrorHandler } from '../lib/sync-error-handler';

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

  // Register service worker
  useServiceWorker();

  // Initialize background sync system
  useEffect(() => {
    let backgroundSyncManager: BackgroundSyncManager | null = null;

    try {
      const dataService = UnifiedDataService.getInstance();
      const connectionMonitor = new ConnectionMonitor();
      backgroundSyncManager = new BackgroundSyncManager(dataService, connectionMonitor);

      console.log('Background sync system initialized successfully');
      syncErrorHandler.logError(
        'initialization',
        'Background sync system initialized successfully',
      );

      // Cleanup on unmount
      return () => {
        try {
          if (backgroundSyncManager) {
            backgroundSyncManager.dispose();
            console.log('Background sync system disposed');
            syncErrorHandler.logError('disposal', 'Background sync system disposed successfully');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown disposal error';
          console.error('Error disposing background sync system:', error);
          syncErrorHandler.logError(
            'disposal',
            errorMessage,
            undefined,
            error instanceof Error ? error : undefined,
          );
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('Error initializing background sync system:', error);
      syncErrorHandler.logError(
        'initialization',
        errorMessage,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

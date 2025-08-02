'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import type { UpdateProductInput } from '@/types/api';
import type { OfflineProduct } from '@/lib/db/indexeddb';

interface MutationOptions {
  onSuccess?: (data: OfflineProduct) => void;
  onError?: (error: Error) => void;
}

export const useUpdateProduct = (options?: MutationOptions) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  const userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<OfflineProduct | null>(null);

  const mutate = async (input: UpdateProductInput) => {
    if (status === 'loading' || userId <= 0) {
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      let result: OfflineProduct;

      if (isOnline) {
        try {
          // Try online first
          const apiResult = await trpcClient.product.update.mutate(input);
          // Transform to OfflineProduct format
          result = {
            ...apiResult,
            updatedAt: apiResult.createdAt,
            synced: true
          };
          
          // Update cache in IndexedDB
          try {
            await offlineStorage.syncProducts(userId, [result]);
          } catch (cacheError) {
            console.warn('Failed to cache updated product:', cacheError);
          }
        } catch (onlineError) {
          console.warn('Online update failed, using offline:', onlineError);
          // Fallback to offline
          result = await offlineStorage.updateProduct(userId, input);
        }
      } else {
        // Use offline storage when offline
        result = await offlineStorage.updateProduct(userId, input);
      }

      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj);
      options?.onError?.(errorObj);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error, data };
};
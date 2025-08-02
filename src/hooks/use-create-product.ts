'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import type { CreateProductInput } from '@/types/api';
import type { OfflineProduct } from '@/lib/db/indexeddb';

interface MutationOptions {
  onSuccess?: (data: OfflineProduct) => void;
  onError?: (error: Error) => void;
}

export const useCreateProduct = (options?: MutationOptions) => {
  const { data: session, status } = useSession();
  const isOnline = useNetworkStatus();
  
  // Fallback for offline: try to get cached userId from localStorage
  let userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;
  if (userId === 0 && !isOnline) {
    const cachedUserId = localStorage.getItem('cachedUserId');
    if (cachedUserId) {
      userId = parseInt(cachedUserId);
    }
  } else if (userId > 0 && isOnline) {
    localStorage.setItem('cachedUserId', userId.toString());
  }
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<OfflineProduct | null>(null);

  const mutate = async (input: CreateProductInput) => {
    if (status === 'loading' || (userId <= 0 && isOnline)) {
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      let result: OfflineProduct;

      if (isOnline) {
        try {
          // Try online first
          const apiResult = await trpcClient.product.create.mutate(input);
          // Transform to OfflineProduct format
          result = {
            ...apiResult,
            updatedAt: apiResult.createdAt,
            synced: true
          };
          
          // Cache to IndexedDB
          try {
            await offlineStorage.syncProducts(userId, [result]);
          } catch (cacheError) {
            console.warn('Failed to cache created product:', cacheError);
          }
        } catch (onlineError) {
          console.warn('Online create failed, using offline:', onlineError);
          // Fallback to offline
          result = await offlineStorage.createProduct(userId, input);
        }
      } else {
        // Use offline storage when offline
        result = await offlineStorage.createProduct(userId, input);
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
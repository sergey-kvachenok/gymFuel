import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNetworkStatus } from './use-network-status';
import { offlineStorage } from '@/lib/offline/storage';
import { trpcClient } from '@/lib/trpc-client';
import { UpdateProductInput, DeleteProductInput } from '../types/api';
import type { OfflineProduct } from '@/lib/db/indexeddb';

export const useProductManipulation = () => {
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

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const updateProduct = useCallback(
    async (data: UpdateProductInput) => {
      if (status === 'loading' || (userId <= 0 && isOnline)) {
        return;
      }

      setIsUpdating(true);
      setUpdateError(null);

      try {
        let result: OfflineProduct;

        if (isOnline) {
          try {
            // Try online first
            const apiResult = await trpcClient.product.update.mutate(data);
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
            result = await offlineStorage.updateProduct(userId, data);
          }
        } else {
          // Use offline storage when offline
          result = await offlineStorage.updateProduct(userId, data);
        }
      } catch (err) {
        const errorObj = err as Error;
        setUpdateError(errorObj);
        alert(`Error updating product: ${errorObj.message}`);
      } finally {
        setIsUpdating(false);
      }
    },
    [userId, isOnline, status],
  );

  const deleteProduct = useCallback(
    async (data: DeleteProductInput) => {
      if (status === 'loading' || (userId <= 0 && isOnline)) {
        return;
      }

      setIsDeleting(true);
      setDeleteError(null);

      try {
        if (isOnline) {
          try {
            // Try online first
            await trpcClient.product.delete.mutate(data);
            
            // Remove from cache
            try {
              await offlineStorage.deleteProduct(userId, data.id);
            } catch (cacheError) {
              console.warn('Failed to remove deleted product from cache:', cacheError);
            }
          } catch (onlineError) {
            console.warn('Online delete failed, using offline:', onlineError);
            // Fallback to offline
            await offlineStorage.deleteProduct(userId, data.id);
          }
        } else {
          // Use offline storage when offline
          await offlineStorage.deleteProduct(userId, data.id);
        }
      } catch (err) {
        const errorObj = err as Error;
        setDeleteError(errorObj);
        alert(`Error deleting product: ${errorObj.message}`);
      } finally {
        setIsDeleting(false);
      }
    },
    [userId, isOnline, status],
  );

  return {
    updateProduct,
    deleteProduct,
    isUpdating,
    isDeleting,
    updateError,
    deleteError,
  };
};

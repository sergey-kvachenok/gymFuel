import { useCallback } from 'react';
import { trpc } from '../lib/trpc-client';
import { UpdateProductInput, DeleteProductInput } from '../types/api';
import { useOnlineStatus } from './use-online-status';
import { offlineDataService } from '../lib/offline-data-service';

export const useProductManipulation = (userId: number | null) => {
  const utils = trpc.useUtils();
  const isOnline = useOnlineStatus();

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate();
    },
    onError: (error) => {
      alert(`Error updating product: ${error.message}`);
    },
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate();
    },
    onError: (error) => {
      alert(`Error deleting product: ${error.message}`);
    },
  });

  const updateProduct = useCallback(
    async (data: UpdateProductInput) => {
      if (isOnline) {
        updateMutation.mutate(data);
      } else {
        try {
          if (!userId) {
            alert('User not authenticated');
            return;
          }
          await offlineDataService.updateProduct(data.id, data);
          // Invalidate queries to refresh UI from IndexedDB
          utils.product.getAll.invalidate();
        } catch (error) {
          alert(
            `Error updating product offline: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    },
    [updateMutation, isOnline, utils.product.getAll, userId],
  );

  const deleteProduct = useCallback(
    async (data: DeleteProductInput) => {
      if (isOnline) {
        deleteMutation.mutate(data);
      } else {
        try {
          if (!userId) {
            alert('User not authenticated');
            return;
          }
          await offlineDataService.deleteProduct(data.id);
          // Invalidate queries to refresh UI from IndexedDB
          utils.product.getAll.invalidate();
        } catch (error) {
          alert(
            `Error deleting product offline: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    },
    [deleteMutation, isOnline, utils.product.getAll, userId],
  );

  return {
    updateProduct,
    deleteProduct,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};

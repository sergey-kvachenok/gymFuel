import { useCallback } from 'react';
import { trpc } from '../lib/trpc-client';
import { UpdateProductInput, DeleteProductInput } from '../types/api';

export const useProductManipulation = () => {
  const utils = trpc.useUtils();

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
    (data: UpdateProductInput) => {
      updateMutation.mutate(data);
    },
    [updateMutation],
  );

  const deleteProduct = useCallback(
    (data: DeleteProductInput) => {
      deleteMutation.mutate(data);
    },
    [deleteMutation],
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

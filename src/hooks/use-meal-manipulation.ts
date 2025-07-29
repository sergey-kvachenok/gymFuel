import { useCallback } from 'react';
import { trpc } from '../lib/trpc-client';
import { UpdateConsumptionInput, DeleteConsumptionInput } from '../types/api';

export const useMealManipulation = () => {
  const utils = trpc.useUtils();

  const updateMutation = trpc.consumption.update.useMutation({
    onSuccess: () => {
      utils.consumption.invalidate();
    },
    onError: (error) => {
      alert(`Error updating: ${error.message}`);
    },
  });

  const deleteMutation = trpc.consumption.delete.useMutation({
    onSuccess: () => {
      utils.consumption.invalidate();
    },
    onError: (error) => {
      alert(`Error deleting: ${error.message}`);
    },
  });

  const updateMeal = useCallback(
    (data: { id: number; amount: number }) => {
      updateMutation.mutate(data as UpdateConsumptionInput);
    },
    [updateMutation],
  );

  const deleteMeal = useCallback(
    (data: { id: number }) => {
      deleteMutation.mutate(data as DeleteConsumptionInput);
    },
    [deleteMutation],
  );

  return {
    updateMeal,
    deleteMeal,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};

import { useCallback } from 'react';
import { trpc } from '../lib/trpc-client';
import { UpdateConsumptionInput, DeleteConsumptionInput } from '../types/api';
import { useOnlineStatus } from './use-online-status';
import { offlineDataService } from '../lib/offline-data-service';

export const useMealManipulation = () => {
  const utils = trpc.useUtils();
  const isOnline = useOnlineStatus();

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
    async (data: { id: number; amount: number }) => {
      if (isOnline) {
        updateMutation.mutate(data as UpdateConsumptionInput);
      } else {
        try {
          await offlineDataService.updateConsumption(data.id, { amount: data.amount });
          // Invalidate queries to refresh UI from IndexedDB
          utils.consumption.invalidate();
        } catch (error) {
          alert(
            `Error updating meal offline: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    },
    [updateMutation, isOnline, utils.consumption],
  );

  const deleteMeal = useCallback(
    async (data: { id: number }) => {
      if (isOnline) {
        deleteMutation.mutate(data as DeleteConsumptionInput);
      } else {
        try {
          await offlineDataService.deleteConsumption(data.id);
          // Invalidate queries to refresh UI from IndexedDB
          utils.consumption.invalidate();
        } catch (error) {
          alert(
            `Error deleting meal offline: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    },
    [deleteMutation, isOnline, utils.consumption],
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

'use client';
import { useCallback, useState } from 'react';
import { trpc } from '../../../../lib/trpc-client';
import { calculateNutrients } from '../../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { DeleteMeal } from './TodaysMeals/DeleteMeal';
import { EditMeal } from './TodaysMeals/EditMeal';

type Consumption = {
  id: number;
  amount: number;
  createdAt: Date | string;
  product: {
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

type MealsListProps = {
  consumptions?: Consumption[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  showActions?: boolean; // Показывать ли кнопки редактирования/удаления
};

export default function MealsList({
  consumptions,
  isLoading = false,
  error = null,
  title = "Today's Meals",
  showActions = false,
}: MealsListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const updateMutation = trpc.consumption.update.useMutation({
    onSuccess: () => {
      utils.consumption.invalidate();
      setEditingId(null);
    },
    onError: (error) => {
      alert(`Error updating: ${error.message}`);
    },
  });

  const deleteMutation = trpc.consumption.delete.useMutation({
    onSuccess: () => {
      utils.consumption.invalidate();
      setDeletingId(null);
    },
    onError: (error) => {
      alert(`Error deleting: ${error.message}`);
    },
  });

  const handleEdit = (consumption: Consumption) => {
    setEditingId(consumption.id);
    setEditAmount(consumption.amount);
  };

  const handleSave = useCallback(() => {
    if (editingId && editAmount > 0) {
      updateMutation.mutate({ id: editingId, amount: editAmount });
    }
  }, [editingId, editAmount, updateMutation]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditAmount(0);
  }, []);

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = useCallback(() => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
  }, [deletingId, deleteMutation]);

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-gray-500">Loading meals...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-red-500">Error loading meals: {error}</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">{title}</CardTitle>

      {!consumptions || consumptions.length === 0 ? (
        <CardContent className="text-gray-500 text-center py-8">
          No meals recorded today. Add your first meal above!
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-2 overflow-y-auto h-50">
          {consumptions.map((consumption) => {
            const nutrients = calculateNutrients(consumption);
            const isEditing = editingId === consumption.id;
            const isDeleting = deletingId === consumption.id;

            if (isEditing) {
              return (
                <div key={consumption.id} className="p-2 bg-gray-100 rounded-lg ">
                  <EditMeal
                    productName={consumption.product.name}
                    editAmount={editAmount}
                    setEditAmount={setEditAmount}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                    isPending={updateMutation.isPending}
                  />
                </div>
              );
            }

            if (isDeleting) {
              return (
                <div key={consumption.id} className="p-2 bg-gray-100 rounded-lg ">
                  <DeleteMeal
                    confirmDelete={confirmDelete}
                    cancelDelete={cancelDelete}
                    isPending={deleteMutation.isPending}
                  />
                </div>
              );
            }

            return (
              <div key={consumption.id} className="p-2 bg-gray-100 rounded-lg ">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {consumption.product.name}
                    </h3>

                    <p className="text-xs text-gray-600 mt-1">
                      {consumption.amount}g → {nutrients.calories} cal | P: {nutrients.protein}g |
                      F: {nutrients.fat}g | C: {nutrients.carbs}g
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400">
                      {new Date(consumption.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {showActions && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(consumption)}
                          variant="secondary"
                          size="sm"
                          className="text-xs !p-2"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(consumption.id)}
                          variant="destructive"
                          size="sm"
                          className="text-xs !p-2"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

'use client';
import { useState } from 'react';
import { trpc } from '../../lib/trpc-client';
import { calculateNutrients } from '../../lib/utils';

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

  const handleSave = () => {
    if (editingId && editAmount > 0) {
      updateMutation.mutate({ id: editingId, amount: editAmount });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount(0);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-gray-500">Loading meals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-red-500">Error loading meals: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {!consumptions || consumptions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No meals recorded today. Add your first meal above!
        </div>
      ) : (
        <div className="space-y-3">
          {consumptions.map((consumption) => {
            const nutrients = calculateNutrients(consumption);
            const isEditing = editingId === consumption.id;
            const isDeleting = deletingId === consumption.id;

            return (
              <div key={consumption.id} className="p-4 bg-gray-50 rounded-lg">
                {isDeleting ? (
                  // Delete Confirmation
                  <div className="flex justify-between items-center">
                    <div className="text-red-600 font-medium">
                      Delete this meal? This action cannot be undone.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmDelete}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{consumption.product.name}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Amount (g):</label>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                        min="1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={updateMutation.isPending || editAmount <= 0}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal View
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{consumption.product.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {consumption.amount}g → {nutrients.calories} cal | P: {nutrients.protein}g |
                        F: {nutrients.fat}g | C: {nutrients.carbs}g
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-400">
                        {new Date(consumption.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {showActions && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(consumption)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(consumption.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

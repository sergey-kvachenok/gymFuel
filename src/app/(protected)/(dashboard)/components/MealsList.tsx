'use client';
import React, { FC, useMemo, useCallback } from 'react';
import { calculateNutrients, formatTime } from '../../../../lib/utils';
import EditableList from '../../../../components/EditableList';
import { ConsumptionItem } from '../../../../types/api';
import { useMealManipulation } from '../../../../hooks/use-meal-manipulation';

interface MealsListProps {
  consumptions?: ConsumptionItem[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  showActions?: boolean;
  userId?: number | null;
}

const MealsList: FC<MealsListProps> = ({
  consumptions,
  isLoading = false,
  error = null,
  title = "Today's Meals",
  showActions = false,
  userId = null,
}) => {
  const { updateMeal, deleteMeal, isUpdating, isDeleting } = useMealManipulation(userId);

  const renderMeal = useCallback((consumption: ConsumptionItem) => {
    const nutrients = calculateNutrients(consumption);

    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{consumption.product.name}</h3>
          <p className="text-xs text-gray-600 mt-1">
            {consumption.amount}g → {nutrients.calories} cal | P: {nutrients.protein}g | F:{' '}
            {nutrients.fat}g | C: {nutrients.carbs}g
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">{formatTime(new Date(consumption.createdAt))}</p>
        </div>
      </div>
    );
  }, []);

  const editConfig = useMemo(
    () => ({
      title: 'Edit Meal Amount',
      fields: [{ key: 'amount', label: 'Amount (g)', type: 'number' as const, min: 1 }],
      validateData: (data: { [key: string]: string | number }) =>
        typeof data.amount === 'number' && data.amount > 0,
    }),
    [],
  );

  const deleteConfig = useMemo(
    () => ({
      getItemName: (consumption: ConsumptionItem) => consumption.product.name,
      message: 'Delete this meal? This action cannot be undone.',
    }),
    [],
  );

  const handleEdit = useCallback(
    (consumption: ConsumptionItem) => ({
      amount: consumption.amount,
    }),
    [],
  );

  const handleSave = useCallback(
    (id: number, editData: Record<string, string | number>) => ({
      id,
      amount: editData.amount as number,
    }),
    [],
  );

  const handleDelete = useCallback((id: number) => ({ id }), []);

  // Memoized mutation objects
  const updateMutation = useMemo(
    () => ({
      mutate: (data: Record<string, unknown>) => {
        const { id, amount } = data;
        updateMeal({ id: id as number, amount: amount as number });
      },
      isPending: isUpdating,
    }),
    [updateMeal, isUpdating],
  );

  const deleteMutation = useMemo(
    () => ({
      mutate: (data: Record<string, unknown>) => {
        deleteMeal(data as { id: number });
      },
      isPending: isDeleting,
    }),
    [deleteMeal, isDeleting],
  );

  return (
    <EditableList
      items={consumptions}
      isLoading={isLoading}
      error={error}
      title={title}
      showActions={showActions}
      renderItem={renderMeal}
      editConfig={editConfig}
      deleteConfig={deleteConfig}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      onEdit={handleEdit}
      onSave={handleSave}
      onDelete={handleDelete}
      height={250}
    />
  );
};

export default MealsList;

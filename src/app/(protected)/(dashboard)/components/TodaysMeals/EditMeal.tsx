'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { memo } from 'react';

interface IEditMealProps {
  productName: string;
  editAmount: number;
  setEditAmount: (amount: number) => void;
  handleSave: () => void;
  handleCancel: () => void;
  isPending: boolean;
}

export const EditMeal: React.FC<IEditMealProps> = memo(
  ({ productName, editAmount, setEditAmount, handleSave, handleCancel, isPending }) => {
    return (
      <div className="space-y-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{productName}</h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Amount (g):</label>
          <Input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(Number(e.target.value))}
            min={1}
            className="w-20 text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isPending || editAmount <= 0}
              variant="default"
              size="sm"
              className="text-xs !p-2"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel} variant="secondary" size="sm" className="text-xs !p-2">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

EditMeal.displayName = 'EditMeal';

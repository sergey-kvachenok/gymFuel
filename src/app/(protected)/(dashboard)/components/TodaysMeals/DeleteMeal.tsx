'use client';

import { Button } from '@/components/ui/button';
import React, { memo } from 'react';

interface IDeleteMealProps {
  confirmDelete: () => void;
  cancelDelete: () => void;
  isPending: boolean;
}

export const DeleteMeal: React.FC<IDeleteMealProps> = memo(
  ({ confirmDelete, cancelDelete, isPending }) => {
    return (
      <div className="flex justify-between items-center">
        <div className="text-red-600 font-medium">
          Delete this meal? This action cannot be undone.
        </div>
        <div className="flex gap-2">
          <Button
            onClick={confirmDelete}
            disabled={isPending}
            variant="destructive"
            size="sm"
            className="text-xs !p-2"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <Button onClick={cancelDelete} variant="secondary" size="sm" className="text-xs !p-2">
            Cancel
          </Button>
        </div>
      </div>
    );
  },
);

DeleteMeal.displayName = 'DeleteMeal';

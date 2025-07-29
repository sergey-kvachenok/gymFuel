'use client';

import { Button } from '@/components/ui/button';
import React, { memo } from 'react';

interface DeleteItemProps {
  itemName: string;
  confirmDelete: () => void;
  cancelDelete: () => void;
  isPending: boolean;
  message?: string;
}

export const DeleteItem: React.FC<DeleteItemProps> = memo(
  ({
    itemName,
    confirmDelete,
    cancelDelete,
    isPending,
    message = `Delete "${itemName}"? This action cannot be undone.`,
  }) => {
    return (
      <div className="flex justify-between items-center">
        <div className="text-red-600 font-medium">{message}</div>
        <div className="flex gap-2">
          <Button onClick={confirmDelete} disabled={isPending} variant="destructive" size="sm">
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <Button onClick={cancelDelete} variant="secondary" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    );
  },
);

DeleteItem.displayName = 'DeleteItem';

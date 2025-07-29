'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { memo } from 'react';

interface EditItemProps {
  title: string;
  editData: Record<string, string | number>;
  setEditData: (data: Record<string, string | number>) => void;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number';
    placeholder?: string;
    min?: number;
    step?: number;
  }>;
  handleSave: () => void;
  handleCancel: () => void;
  isPending: boolean;
  validateData?: (data: Record<string, string | number>) => boolean;
}

export const EditItem: React.FC<EditItemProps> = memo(
  ({
    title,
    editData,
    setEditData,
    fields,
    handleSave,
    handleCancel,
    isPending,
    validateData = () => true,
  }) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <Input
                type={field.type}
                value={editData[field.key] || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                  })
                }
                placeholder={field.placeholder}
                min={field.min}
                step={field.step}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isPending || !validateData(editData)}
            variant="default"
            size="sm"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={handleCancel} variant="secondary" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    );
  },
);

EditItem.displayName = 'EditItem';

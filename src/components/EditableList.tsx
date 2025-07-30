'use client';
import React, { useState, useCallback, ReactNode } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { EditItem } from './EditItem';
import { DeleteItem } from './DeleteItem';
import { EditableItem, EditableListMutation, EditData, MutationData } from '@/types/api';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export interface EditableListProps<T extends EditableItem> {
  items?: T[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  showActions?: boolean;
  height?: number;

  renderItem: (item: T, isEditing: boolean, isDeleting: boolean) => ReactNode;

  editConfig?: {
    title: string;
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'number';
      placeholder?: string;
      min?: number;
      step?: number;
    }>;
    validateData?: (data: EditData) => boolean;
  };

  deleteConfig?: {
    getItemName: (item: T) => string;
    message?: string;
  };

  updateMutation: EditableListMutation<MutationData>;
  deleteMutation: EditableListMutation<{ id: number }>;

  onEdit: (item: T) => EditData;
  onSave: (id: number, editData: EditData) => MutationData;
  onDelete: (id: number) => { id: number };
}

const EditableList = <T extends EditableItem>({
  items,
  isLoading = false,
  error = null,
  title = 'List',
  showActions = false,
  renderItem,
  editConfig,
  deleteConfig,
  updateMutation,
  deleteMutation,
  onEdit,
  onSave,
  onDelete,
  height,
}: EditableListProps<T>) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEdit = useCallback(
    (item: T) => {
      setEditingId(item.id);
      setEditData(onEdit(item));
    },
    [onEdit],
  );

  const handleSave = useCallback(() => {
    if (editingId && editData) {
      const mutationData = onSave(editingId, editData);
      updateMutation.mutate(mutationData);

      setEditingId(null);
      setEditData(null);
    }
  }, [editingId, editData, onSave, updateMutation]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditData(null);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setDeletingId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingId) {
      const mutationData = onDelete(deletingId);
      deleteMutation.mutate(mutationData);

      setDeletingId(null);
    }
  }, [deletingId, onDelete, deleteMutation]);

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardTitle className="mb-4">{title}</CardTitle>
        <CardContent>
          <div className="text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardTitle className="mb-4">{title}</CardTitle>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">{title}</CardTitle>
      <CardContent
        className={cn('overflow-y-auto overscroll-contain')}
        style={height ? { height: `${height}px` } : undefined}
      >
        {!items || items.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No items found.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isDeleting = deletingId === item.id;

              if (isEditing && editConfig && editData) {
                return (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                    <EditItem
                      title={editConfig.title}
                      editData={editData}
                      setEditData={setEditData}
                      fields={editConfig.fields}
                      handleSave={handleSave}
                      handleCancel={handleCancel}
                      isPending={updateMutation.isPending}
                      validateData={editConfig.validateData}
                    />
                  </div>
                );
              }

              if (isDeleting && deleteConfig) {
                return (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                    <DeleteItem
                      itemName={deleteConfig.getItemName(item)}
                      confirmDelete={confirmDelete}
                      cancelDelete={cancelDelete}
                      isPending={deleteMutation.isPending}
                      message={deleteConfig.message}
                    />
                  </div>
                );
              }

              return (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                  {renderItem(item, isEditing, isDeleting)}

                  {showActions && (
                    <div className="flex gap-2 mt-1 justify-end">
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="outline"
                        size="sm"
                        className="!px-2 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="destructive"
                        size="sm"
                        className="!px-2 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MemoizedEditableList = React.memo(EditableList) as typeof EditableList;

export default MemoizedEditableList;

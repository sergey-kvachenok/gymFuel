'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc-client';

const nutritionFields = [
  {
    key: 'calories',
    label: 'Calories',
    unit: '',
  },
  {
    key: 'protein',
    label: 'Protein (g)',
    unit: 'g',
  },
  {
    key: 'fat',
    label: 'Fat (g)',
    unit: 'g',
  },
  {
    key: 'carbs',
    label: 'Carbs (g)',
    unit: 'g',
  },
];

export default function ProductList() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: products, isLoading, error } = trpc.product.getAll.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate();
      setEditingId(null);
    },
    onError: (error) => {
      alert(`Error updating product: ${error.message}`);
    },
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate();
      setDeletingId(null);
    },
    onError: (error) => {
      alert(`Error deleting product: ${error.message}`);
    },
  });

  const handleEdit = (product: {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      calories: product.calories,
      protein: product.protein,
      fat: product.fat,
      carbs: product.carbs,
    });
  };

  const handleSave = () => {
    if (editingId && editData.name.trim()) {
      updateMutation.mutate({ id: editingId, ...editData });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 });
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
      <Card>
        <h2 className="text-xl font-bold mb-4">My Products</h2>
        <div className="text-gray-500">Loading products...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4">My Products</h2>
        <div className="text-red-500">Error loading products</div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">My Products</h2>

      {!products || products.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No products yet. Create your first custom product above!
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            const isDeleting = deletingId === product.id;

            return (
              <div key={product.id} className="p-4 bg-gray-50 rounded-lg">
                {isDeleting ? (
                  // Delete Confirmation
                  <div className="flex justify-between items-center">
                    <div className="text-red-600 font-medium">
                      Delete &quot;{product.name}&quot;? This action cannot be undone.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={confirmDelete}
                        disabled={deleteMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                      <Button onClick={cancelDelete} variant="secondary" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : isEditing ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <Input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="Product name"
                        size={undefined}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {nutritionFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                          </label>
                          <Input
                            type="number"
                            value={editData[field.key as keyof typeof editData] as number}
                            onChange={(e) =>
                              setEditData({ ...editData, [field.key]: Number(e.target.value) })
                            }
                            min={0}
                            step={0.1}
                            size={undefined}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending || !editData.name.trim()}
                        variant="default"
                        size="sm"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button onClick={handleCancel} variant="secondary" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Normal View
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        Per 100g: {product.calories} cal | P: {product.protein}g | F: {product.fat}g
                        | C: {product.carbs}g
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button onClick={() => handleEdit(product)} variant="secondary" size="sm">
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(product.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

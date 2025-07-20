'use client';
import { useState } from 'react';
import { trpc } from '../../lib/trpc-client';

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
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">My Products</h2>
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">My Products</h2>
        <div className="text-red-500">Error loading products</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Product name"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calories
                        </label>
                        <input
                          type="number"
                          value={editData.calories}
                          onChange={(e) =>
                            setEditData({ ...editData, calories: Number(e.target.value) })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          value={editData.protein}
                          onChange={(e) =>
                            setEditData({ ...editData, protein: Number(e.target.value) })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          value={editData.fat}
                          onChange={(e) =>
                            setEditData({ ...editData, fat: Number(e.target.value) })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          value={editData.carbs}
                          onChange={(e) =>
                            setEditData({ ...editData, carbs: Number(e.target.value) })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending || !editData.name.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                      >
                        Cancel
                      </button>
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
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        Delete
                      </button>
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

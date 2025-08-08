'use client';
import { FC, useMemo, useCallback, useState } from 'react';
import ProductSearch from '@/components/ProductSearch';
import EditableList from '@/components/EditableList';
import { Product, UpdateProductInput } from '@/types/api';
import { useProducts } from '../../../../hooks/use-products';

const fields = [
  { key: 'name', label: 'Product Name', type: 'text' as const, placeholder: 'Product name' },
  { key: 'calories', label: 'Calories', type: 'number' as const, min: 0, step: 0.1 },
  { key: 'protein', label: 'Protein (g)', type: 'number' as const, min: 0, step: 0.1 },
  { key: 'fat', label: 'Fat (g)', type: 'number' as const, min: 0, step: 0.1 },
  { key: 'carbs', label: 'Carbs (g)', type: 'number' as const, min: 0, step: 0.1 },
];

const ProductList: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { products, isLoading, error, updateProduct, deleteProduct, isPending } = useProducts({
    searchOptions: {
      query: searchQuery || undefined,
      orderBy: 'name',
      orderDirection: 'asc',
    },
  });

  const renderProduct = useCallback(
    (product: Product) => (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
          <div className="text-sm text-gray-600 mt-1">
            Per 100g: {product.calories} cal | P: {product.protein}g | F: {product.fat}g | C:{' '}
            {product.carbs}g
          </div>
        </div>
      </div>
    ),
    [],
  );

  const editConfig = useMemo(
    () => ({
      title: 'Edit Product',
      fields,
      validateData: (data: Record<string, string | number>) =>
        typeof data.name === 'string' && data.name.trim().length > 0,
    }),
    [],
  );

  const deleteConfig = useMemo(
    () => ({
      getItemName: (product: { name: string }) => product.name,
    }),
    [],
  );

  const updateMutation = useMemo(
    () => ({
      mutate: (data: Record<string, unknown>) => updateProduct(data as UpdateProductInput),
      isPending,
    }),
    [isPending, updateProduct],
  );

  const deleteMutation = useMemo(
    () => ({
      mutate: (data: Record<string, unknown>) => deleteProduct({ id: data.id as number }),
      isPending,
    }),
    [deleteProduct, isPending],
  );

  const handleEdit = useCallback(
    (product: Product) => ({
      name: product.name,
      calories: product.calories,
      protein: product.protein,
      fat: product.fat,
      carbs: product.carbs,
    }),
    [],
  );

  const handleSave = useCallback(
    (id: number, editData: Record<string, string | number>) => ({
      id,
      ...editData,
    }),
    [],
  );

  const handleDelete = useCallback((id: number) => ({ id }), []);

  return (
    <div>
      <div className="mb-4">
        <ProductSearch onSearchChange={setSearchQuery} placeholder="Search your products..." />
      </div>

      <EditableList
        items={products}
        isLoading={isLoading}
        error={error?.message}
        title="My Products"
        showActions={true}
        renderItem={renderProduct}
        editConfig={editConfig}
        deleteConfig={deleteConfig}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        onEdit={handleEdit}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProductList;

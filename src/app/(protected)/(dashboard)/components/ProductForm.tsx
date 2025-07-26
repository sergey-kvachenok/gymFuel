'use client';
import { useState } from 'react';
import { trpc } from '../../../../lib/trpc-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const nutritionFields = [
  {
    key: 'calories',
    placeholder: 'Calories (per 100g)',
    step: 1,
  },
  {
    key: 'protein',
    placeholder: 'Protein (g)',
    step: 0.1,
  },
  {
    key: 'fat',
    placeholder: 'Fat (g)',
    step: 0.1,
  },
  {
    key: 'carbs',
    placeholder: 'Carbs (g)',
    step: 0.1,
  },
];

export default function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  });
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate();
      setFormData({ name: '', calories: '', protein: '', fat: '', carbs: '' });
      setError('');
      onSuccess?.();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const caloriesNum = parseFloat(formData.calories);
    const proteinNum = parseFloat(formData.protein);
    const fatNum = parseFloat(formData.fat);
    const carbsNum = parseFloat(formData.carbs);

    if (
      !formData.name ||
      isNaN(caloriesNum) ||
      isNaN(proteinNum) ||
      isNaN(fatNum) ||
      isNaN(carbsNum)
    ) {
      setError('Please fill all fields with valid numbers');
      return;
    }

    createProduct.mutate({
      name: formData.name,
      calories: caloriesNum,
      protein: proteinNum,
      fat: fatNum,
      carbs: carbsNum,
    });
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <Card>
      <CardTitle className="mb-4">Add New Product</CardTitle>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-2">
          <Input
            type="text"
            placeholder="Product name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            {nutritionFields.slice(0, 2).map((field) => (
              <Input
                key={field.key}
                type="number"
                step={field.step}
                placeholder={field.placeholder}
                value={formData[field.key as keyof typeof formData] as string}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {nutritionFields.slice(2).map((field) => (
              <Input
                key={field.key}
                type="number"
                step={field.step}
                placeholder={field.placeholder}
                value={formData[field.key as keyof typeof formData] as string}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            ))}
          </div>

          <Button type="submit" disabled={createProduct.isPending} className="w-full">
            {createProduct.isPending ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

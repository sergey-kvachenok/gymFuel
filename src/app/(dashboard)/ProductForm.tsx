'use client';
import { useState } from 'react';
import { trpc } from '../../lib/trpc-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProductForm() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      // Обновляем список продуктов
      utils.product.getAll.invalidate();
      // Очищаем форму
      setName('');
      setCalories('');
      setProtein('');
      setFat('');
      setCarbs('');
      setError('');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const caloriesNum = parseFloat(calories);
    const proteinNum = parseFloat(protein);
    const fatNum = parseFloat(fat);
    const carbsNum = parseFloat(carbs);

    if (!name || isNaN(caloriesNum) || isNaN(proteinNum) || isNaN(fatNum) || isNaN(carbsNum)) {
      setError('Please fill all fields with valid numbers');
      return;
    }

    createProduct.mutate({
      name,
      calories: caloriesNum,
      protein: proteinNum,
      fat: fatNum,
      carbs: carbsNum,
    });
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Calories (per 100g)"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.1"
            placeholder="Fat (g)"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={createProduct.isPending} className="w-full">
          {createProduct.isPending ? 'Adding...' : 'Add Product'}
        </Button>
      </form>
    </Card>
  );
}

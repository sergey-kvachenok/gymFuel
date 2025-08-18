'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { UnifiedDataService } from '../../../../lib/unified-data-service';

const nutritionFields = [
  {
    key: 'calories',
    placeholder: 'Calories (per 100g)',
    step: 1,
    testId: 'product-calories',
  },
  {
    key: 'protein',
    placeholder: 'Protein (g)',
    step: 0.1,
    testId: 'product-protein',
  },
  {
    key: 'fat',
    placeholder: 'Fat (g)',
    step: 0.1,
    testId: 'product-fat',
  },
  {
    key: 'carbs',
    placeholder: 'Carbs (g)',
    step: 0.1,
    testId: 'product-carbs',
  },
];

export default function ProductForm({
  onSuccess,
  userId,
}: {
  onSuccess?: () => void;
  userId: number | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const unifiedDataService = UnifiedDataService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

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
      setIsSubmitting(false);
      return;
    }

    if (!userId) {
      setError('User ID is required for product creation');
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name: formData.name,
      calories: caloriesNum,
      protein: proteinNum,
      fat: fatNum,
      carbs: carbsNum,
      userId,
    };

    try {
      const createdProduct = await unifiedDataService.createProduct(productData);
      console.log('Product created successfully:', createdProduct);

      // Reset form
      setFormData({ name: '', calories: '', protein: '', fat: '', carbs: '' });
      setError('');
      setSyncStatus('synced');

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error('Product creation failed:', error);
      setError(
        `Error creating product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <Card data-testid="product-form-card">
      <CardTitle className="mb-4" data-testid="product-form-title">
        Add New Product
      </CardTitle>
      {error && (
        <div className="text-red-500 text-sm mb-4" data-testid="product-form-error">
          {error}
        </div>
      )}
      {syncStatus === 'synced' && (
        <div className="text-green-600 text-sm mb-4" data-testid="product-form-sync-success">
          ✓ Product saved and will sync when online
        </div>
      )}

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col gap-2"
          data-testid="product-form"
        >
          <Input
            type="text"
            placeholder="Product name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            data-testid="product-name"
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
                data-testid={field.testId}
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
                data-testid={field.testId}
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            data-testid="product-submit"
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

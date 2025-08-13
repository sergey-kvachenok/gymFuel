'use client';
import { useState } from 'react';
import { trpc } from '../../../../lib/trpc-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useOnlineStatus } from '../../../../hooks/use-online-status';
import { offlineDataService } from '../../../../lib/offline-data-service';

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

  const utils = trpc.useUtils();
  const isOnline = useOnlineStatus();

  const createProduct = trpc.product.create.useMutation({
    onMutate: (variables) => {
      console.log('🎯 onMutate called with:', variables);
    },
    onSuccess: async (newProduct) => {
      console.log('🎯 onSuccess callback triggered!');
      console.log('🔄 Product created successfully:', newProduct);
      console.log('🔄 User ID for caching:', userId);
      console.log('🔄 Is online for caching:', isOnline);

      // Cache the newly created product to IndexedDB for offline use
      if (userId) {
        try {
          console.log('🔄 Caching product to IndexedDB...');
          console.log('🔄 Product data to cache:', newProduct);
          await offlineDataService.cacheServerProducts([newProduct]);
          console.log('✅ Product cached to IndexedDB for offline use:', newProduct.name);
        } catch (error) {
          console.error('❌ Failed to cache product to IndexedDB:', error);
          console.error('❌ Error details:', error);
        }
      } else {
        console.log('⚠️ No userId available for caching');
      }

      utils.product.getAll.invalidate();
      setFormData({ name: '', calories: '', protein: '', fat: '', carbs: '' });
      setError('');
      setIsSubmitting(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.log('🎯 onError callback triggered!');
      console.error('❌ Product creation failed:', error);
      setError(error.message);
      setIsSubmitting(false);
    },
    onSettled: () => {
      console.log('🎯 onSettled callback triggered!');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 handleSubmit called');
    console.log('🎯 Form data:', formData);
    console.log('🎯 Is online:', isOnline);
    console.log('🎯 User ID:', userId);
    console.log('🎯 Event type:', e.type);
    console.log('🎯 Event target:', e.target);
    console.log('🎯 Navigator online status:', navigator.onLine);

    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const caloriesNum = parseFloat(formData.calories);
    const proteinNum = parseFloat(formData.protein);
    const fatNum = parseFloat(formData.fat);
    const carbsNum = parseFloat(formData.carbs);

    console.log('🎯 Parsed values:', { caloriesNum, proteinNum, fatNum, carbsNum });

    if (
      !formData.name ||
      isNaN(caloriesNum) ||
      isNaN(proteinNum) ||
      isNaN(fatNum) ||
      isNaN(carbsNum)
    ) {
      console.log('🎯 Validation failed');
      setError('Please fill all fields with valid numbers');
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name: formData.name,
      calories: caloriesNum,
      protein: proteinNum,
      fat: fatNum,
      carbs: carbsNum,
    };

    console.log('🎯 About to call createProduct.mutate with:', productData);

    if (isOnline) {
      console.log('🌐 Online mode - calling tRPC mutation');
      createProduct.mutate(productData);
      console.log('🌐 tRPC mutation called');
    } else {
      console.log('📱 Offline mode - using IndexedDB');
      console.log('📱 User ID for offline creation:', userId);
      console.log('📱 Product data for offline creation:', productData);
      
      try {
        if (!userId) {
          throw new Error('User ID is required for offline product creation');
        }
        
        console.log('📱 Calling offlineDataService.createProduct...');
        const createdProduct = await offlineDataService.createProduct({ ...productData, userId });
        console.log('📱 Product created offline:', createdProduct);

        console.log('📱 Invalidating product queries...');
        utils.product.getAll.invalidate();
        
        console.log('📱 Resetting form...');
        setFormData({ name: '', calories: '', protein: '', fat: '', carbs: '' });
        setError('');
        setIsSubmitting(false);
        
        console.log('📱 Calling onSuccess callback...');
        onSuccess?.();
        console.log('📱 onSuccess callback completed');
      } catch (error) {
        console.error('📱 Offline product creation failed:', error);
        setError(
          `Error creating product offline: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        setIsSubmitting(false);
      }
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
            disabled={isSubmitting || createProduct.isPending}
            className="w-full"
            data-testid="product-submit"
            onClick={() => console.log('🎯 Submit button clicked')}
          >
            {isSubmitting || createProduct.isPending ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';
import { useState } from 'react';
import { trpc } from '../../../../lib/trpc-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import ProductCombobox, { ProductOption } from '@/components/ui/ProductCombobox';

export default function ConsumptionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const { data: products } = trpc.product.getAll.useQuery();
  const utils = trpc.useUtils();

  const createConsumption = trpc.consumption.create.useMutation({
    onSuccess: () => {
      utils.consumption.getDailyStats.invalidate();
      utils.consumption.getByDate.invalidate();

      setSelectedProduct(null);
      setAmount('');
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

    const productId = selectedProduct?.id;
    const amountNum = parseFloat(amount);

    if (!productId || isNaN(amountNum) || amountNum <= 0) {
      setError('Please select a product and enter a valid amount');
      return;
    }

    createConsumption.mutate({
      productId,
      amount: amountNum,
    });
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Add to Today&apos;s Meals</h2>
        <div className="text-gray-500 text-center py-8">
          No products available. Add some products first to track your consumption.
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">Add to Today&apos;s Meals</CardTitle>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col ">
          <ProductCombobox value={selectedProduct} onChange={setSelectedProduct} />

          <Input
            type="number"
            step="0.1"
            placeholder="Amount in grams"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="text-red-500 text-xs h-3 text-center">{error}</div>

          <Button type="submit" disabled={createConsumption.isPending} variant="default">
            {createConsumption.isPending ? 'Adding...' : 'Add to Meals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';
import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  ProductCombobox,
  ProductOption,
} from '@/app/(protected)/(dashboard)/components/Consumption/ProductCombobox';

interface IConsumptionFormProps {
  submitConsumption: (e: React.FormEvent) => void;
  selectedProduct: ProductOption | null;
  setSelectedProduct: (product: ProductOption | null) => void;
  amount?: number;
  error: string;
  isPending: boolean;
  isProductsPresented: boolean;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userId: number | null;
}

export const ConsumptionForm: FC<IConsumptionFormProps> = ({
  submitConsumption,
  selectedProduct,
  setSelectedProduct,
  amount,
  error,
  isPending,
  isProductsPresented,
  onAmountChange,
  userId,
}) => {
  if (!isProductsPresented) {
    return (
      <Card>
        <CardTitle className="mb-4">Add to Today&apos;s Meals</CardTitle>
        <CardContent>
          <div className="text-gray-500 text-center py-8">
            No products available. Add some products first to track your consumption.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">Add to Today&apos;s Meals</CardTitle>

      <CardContent>
        <form onSubmit={submitConsumption} className="space-y-4 flex flex-col ">
          <ProductCombobox value={selectedProduct} onChange={setSelectedProduct} userId={userId} />

          <Input
            type="number"
            step="0.5"
            placeholder="Amount in grams"
            value={amount}
            onChange={onAmountChange}
            data-testid="consumption-amount"
          />

          <div className="text-red-500 text-xs h-3 text-center">{error}</div>

          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            data-testid="consumption-submit"
          >
            {isPending ? 'Adding...' : 'Add to Meals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

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
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
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
  syncStatus = 'idle',
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
    <Card data-testid="consumption-form">
      <CardTitle className="mb-4">
        Add to Today&apos;s Meals
        {syncStatus === 'syncing' && (
          <span className="text-sm text-blue-500 ml-2">(Syncing...)</span>
        )}
        {syncStatus === 'synced' && <span className="text-sm text-green-500 ml-2">(Synced)</span>}
        {syncStatus === 'error' && <span className="text-sm text-red-500 ml-2">(Sync Error)</span>}
      </CardTitle>

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

          {error && (
            <div className="text-red-500 text-xs h-3 text-center" data-testid="error-message">
              {error}
            </div>
          )}

          {syncStatus === 'synced' && (
            <div className="text-green-500 text-xs text-center" data-testid="sync-success-message">
              ✓ Consumption saved and will sync when online
            </div>
          )}

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

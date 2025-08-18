'use client';
import { useCallback, useState, FC } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConsumptionForm } from './ConsumptionForm';
import ProductForm from '../ProductForm';
import { ProductOption } from '@/app/(protected)/(dashboard)/components/Consumption/ProductCombobox';
import { useProductSearch } from '@/hooks/use-product-search';
import { UnifiedDataService } from '@/lib/unified-data-service';
import { useConsumptionsByDate } from '@/hooks/use-consumptions-by-date';

const enum PopupTypes {
  Consumption = 'consumption',
  Product = 'product',
}

const formButtons = [
  {
    label: 'Add Consumption',
    modal: PopupTypes.Consumption,
    variant: 'secondary' as const,
  },
  {
    label: 'Add Product',
    modal: PopupTypes.Product,
    variant: 'secondary' as const,
  },
];

const ConsumptionManager: FC<{ userId: number | null }> = ({ userId }) => {
  const [openModal, setOpenModal] = useState<PopupTypes | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [amount, setAmount] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const { allProducts: products, refreshProducts } = useProductSearch(userId, {
    orderBy: 'name',
    orderDirection: 'asc',
  });
  const { refreshOfflineData } = useConsumptionsByDate(userId);

  const submitConsumption = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);

      const productId = selectedProduct?.id;

      if (!productId || !amount || amount <= 0) {
        setError('Please select a product and enter a valid amount');
        setIsSubmitting(false);
        return;
      }

      if (!userId) {
        setError('User not authenticated');
        setIsSubmitting(false);
        return;
      }

      try {
        const unifiedDataService = UnifiedDataService.getInstance();

        // Fetch the product to include in the consumption
        const product = await unifiedDataService.getProduct(productId);
        if (!product) {
          throw new Error('Product not found');
        }

        const consumptionData = {
          productId,
          amount,
          userId,
          date: new Date(),
          product,
        };

        setSyncStatus('syncing');
        const createdConsumption = await unifiedDataService.createConsumption(consumptionData);
        console.log('Consumption created successfully:', createdConsumption);

        setSyncStatus('synced');

        // Refresh offline data to show the new consumption immediately
        console.log('🔄 Refreshing data after consumption creation...');
        refreshOfflineData();
        refreshProducts();

        // Reset form state
        setSelectedProduct(null);
        setAmount(undefined);
        setError('');
        setOpenModal(null);

        // Show success feedback to user
        console.log('✅ Consumption created successfully and data refreshed');
      } catch (error) {
        console.error('Consumption creation failed:', error);
        setSyncStatus('error');
        setError(
          `Error creating consumption: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedProduct, amount, userId, refreshOfflineData, refreshProducts],
  );

  const onAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const amount = parseFloat(e.target.value);
      setAmount(amount);
      setError('');
    },
    [setAmount, setError],
  );

  return (
    <div className="flex gap-3 items-center flex-wrap justify-center">
      {formButtons.map((button) => (
        <Dialog
          key={button.modal}
          open={openModal === button.modal}
          onOpenChange={(open) => {
            setOpenModal(open ? button.modal : null);
            if (!open && button.modal === PopupTypes.Consumption) {
              setSelectedProduct(null);
              setAmount(undefined);
              setError('');
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant={openModal === button.modal ? 'default' : button.variant}>
              {button.label}
            </Button>
          </DialogTrigger>

          <DialogContent>
            {button.modal === PopupTypes.Consumption && (
              <ConsumptionForm
                submitConsumption={submitConsumption}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                amount={amount}
                error={error}
                isPending={isSubmitting}
                isProductsPresented={!!products && products.length > 0}
                onAmountChange={onAmountChange}
                userId={userId}
                syncStatus={syncStatus}
              />
            )}
            {button.modal === PopupTypes.Product && (
              <ProductForm
                onSuccess={() => {
                  setOpenModal(null);
                  refreshProducts();
                }}
                userId={userId}
              />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default ConsumptionManager;

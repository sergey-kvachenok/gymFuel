'use client';
import { useCallback, useState, FC } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConsumptionForm } from './ConsumptionForm';
import ProductForm from '../ProductForm';
import { trpc } from '@/lib/trpc-client';
import { ProductOption } from '@/app/(protected)/(dashboard)/components/Consumption/ProductCombobox';
import { useProductSearch } from '@/hooks/use-product-search';
import { useOnlineStatus } from '@/hooks/use-online-status';
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

  const { allProducts: products } = useProductSearch(userId, {
    orderBy: 'name',
    orderDirection: 'asc',
  });
  const utils = trpc.useUtils();
  const isOnline = useOnlineStatus();
  const { refreshOfflineData } = useConsumptionsByDate(userId);

  const createConsumption = trpc.consumption.create.useMutation({
    onSuccess: () => {
      utils.consumption.getDailyStats.invalidate();
      utils.consumption.getByDate.invalidate();

      setSelectedProduct(null);
      setAmount(undefined);
      setError('');
      setIsSubmitting(false);
      setOpenModal(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsSubmitting(false);
    },
  });

  const submitConsumption = useCallback(
    async (e: React.FormEvent) => {
      console.log('🔄 submitConsumption function called');
      console.log('📊 Online status:', isOnline);
      console.log('📊 User ID:', userId);
      console.log('📊 Selected product:', selectedProduct);
      console.log('📊 Amount:', amount);

      e.preventDefault();
      setError('');
      setIsSubmitting(true);

      const productId = selectedProduct?.id;

      if (!productId || !amount || amount <= 0) {
        console.log('❌ Validation failed:', { productId, amount });
        setError('Please select a product and enter a valid amount');
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Validation passed, proceeding with consumption creation');

      const consumptionData = {
        productId,
        amount,
      };

      if (isOnline) {
        console.log('🌐 Online mode - using tRPC');
        createConsumption.mutate(consumptionData);
      } else {
        console.log('📱 Offline mode - using UnifiedDataService');
        try {
          if (!userId) {
            console.log('❌ User not authenticated');
            setError('User not authenticated');
            setIsSubmitting(false);
            return;
          }

          const unifiedDataService = UnifiedDataService.getInstance();

          // Fetch the product to include in the consumption
          const product = await unifiedDataService.getProduct(productId);
          if (!product) {
            throw new Error('Product not found');
          }

          const offlineConsumptionData = {
            ...consumptionData,
            userId,
            date: new Date(),
            product,
          };
          console.log('🔄 Creating offline consumption with data:', offlineConsumptionData);

          setSyncStatus('syncing');
          const createdConsumption =
            await unifiedDataService.createConsumption(offlineConsumptionData);
          console.log('📱 Consumption created offline:', createdConsumption);

          setSyncStatus('synced');

          // Refresh offline data to show the new consumption immediately
          console.log('🔄 Refreshing offline data...');
          refreshOfflineData();

          // Invalidate server queries to ensure UI consistency
          utils.consumption.getDailyStats.invalidate();
          utils.consumption.getByDate.invalidate();

          // Reset form state
          setSelectedProduct(null);
          setAmount(undefined);
          setError('');
          setIsSubmitting(false);
          setOpenModal(null);

          // Show success feedback to user
          console.log('✅ Offline consumption created successfully');
        } catch (error) {
          console.error('❌ Offline consumption creation failed:', error);
          setSyncStatus('error');
          setError(
            `Error creating consumption offline: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          );
          setIsSubmitting(false);
        }
      }
    },
    [selectedProduct, amount, createConsumption, isOnline, utils, userId, refreshOfflineData],
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
                isPending={isSubmitting || createConsumption.isPending}
                isProductsPresented={!!products && products.length > 0}
                onAmountChange={onAmountChange}
                userId={userId}
                syncStatus={syncStatus}
              />
            )}
            {button.modal === PopupTypes.Product && (
              <ProductForm onSuccess={() => setOpenModal(null)} userId={userId} />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default ConsumptionManager;

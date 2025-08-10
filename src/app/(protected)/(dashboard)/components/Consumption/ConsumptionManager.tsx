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
import { offlineDataService } from '@/lib/offline-data-service';

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

const ConsumptionManager: FC = () => {
  const [openModal, setOpenModal] = useState<PopupTypes | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [amount, setAmount] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { allProducts: products } = useProductSearch({
    orderBy: 'name',
    orderDirection: 'asc',
  });
  const utils = trpc.useUtils();
  const isOnline = useOnlineStatus();

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
      e.preventDefault();
      setError('');
      setIsSubmitting(true);

      const productId = selectedProduct?.id;

      if (!productId || !amount || amount <= 0) {
        setError('Please select a product and enter a valid amount');
        setIsSubmitting(false);
        return;
      }

      const consumptionData = {
        productId,
        amount,
      };

      if (isOnline) {
        createConsumption.mutate(consumptionData);
      } else {
        try {
          // TODO: Get actual userId from auth context
          await offlineDataService.createConsumption({
            ...consumptionData,
            userId: 1,
            date: new Date(),
          });

          utils.consumption.getDailyStats.invalidate();
          utils.consumption.getByDate.invalidate();
          setSelectedProduct(null);
          setAmount(undefined);
          setError('');
          setIsSubmitting(false);
          setOpenModal(null);
        } catch (error) {
          setError(
            `Error creating consumption offline: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          setIsSubmitting(false);
        }
      }
    },
    [selectedProduct, amount, createConsumption, isOnline, utils],
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
              />
            )}
            {button.modal === PopupTypes.Product && (
              <ProductForm onSuccess={() => setOpenModal(null)} />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default ConsumptionManager;

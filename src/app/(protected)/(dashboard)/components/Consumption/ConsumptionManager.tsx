'use client';
import { useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConsumptionForm } from './ConsumptionForm';
import ProductForm from '../ProductForm';
import { trpc } from '@/lib/trpc-client';
import { ProductOption } from '@/app/(protected)/(dashboard)/components/Consumption/ProductCombobox';

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

export default function ConsumptionManager() {
  const [openModal, setOpenModal] = useState<PopupTypes | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [amount, setAmount] = useState<number | undefined>();
  const [error, setError] = useState('');

  const { data: products } = trpc.product.getAll.useQuery();
  const utils = trpc.useUtils();

  const createConsumption = trpc.consumption.create.useMutation({
    onSuccess: () => {
      utils.consumption.getDailyStats.invalidate();
      utils.consumption.getByDate.invalidate();

      setSelectedProduct(null);
      setAmount(undefined);
      setError('');
      setOpenModal(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const submitConsumption = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const productId = selectedProduct?.id;

      if (!productId || !amount || amount <= 0) {
        setError('Please select a product and enter a valid amount');
        return;
      }

      createConsumption.mutate({
        productId,
        amount,
      });
    },
    [selectedProduct, amount, createConsumption],
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
                isPending={createConsumption.isPending}
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
}

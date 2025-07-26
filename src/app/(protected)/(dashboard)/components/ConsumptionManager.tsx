'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ConsumptionForm from './ConsumptionForm';
import ProductForm from './ProductForm';

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

  return (
    <div className="flex gap-3 items-center flex-wrap justify-center">
      {formButtons.map((button) => (
        <Dialog
          key={button.modal}
          open={openModal === button.modal}
          onOpenChange={(open) => setOpenModal(open ? button.modal : null)}
        >
          <DialogTrigger asChild>
            <Button variant={openModal === button.modal ? 'default' : button.variant}>
              {button.label}
            </Button>
          </DialogTrigger>

          <DialogContent>
            {button.modal === PopupTypes.Consumption && (
              <ConsumptionForm onSuccess={() => setOpenModal(null)} />
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

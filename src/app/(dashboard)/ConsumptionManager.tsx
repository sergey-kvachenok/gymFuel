'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsumptionForm from './ConsumptionForm';
import ProductForm from './ProductForm';

export enum ConsumptionTabs {
  Consumption = 'consumption',
  Products = 'products',
}

const ConsumptionManager = () => {
  const [activeTab, setActiveTab] = useState<ConsumptionTabs>(ConsumptionTabs.Consumption);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as ConsumptionTabs)}
      className="w-full"
    >
      <TabsList className="w-full">
        <TabsTrigger value={ConsumptionTabs.Consumption} className="flex-1">
          Add Consumption
        </TabsTrigger>
        <TabsTrigger value={ConsumptionTabs.Products} className="flex-1">
          Manage Products
        </TabsTrigger>
      </TabsList>
      <div className="relative min-h-[340px]">
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            activeTab === ConsumptionTabs.Consumption
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ConsumptionForm />
        </div>

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            activeTab === ConsumptionTabs.Products
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ProductForm />
        </div>
      </div>
    </Tabs>
  );
};

export default ConsumptionManager;

'use client';
import { FC, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ConsumptionForm from './ConsumptionForm';

interface DashboardClientProps {
  userName: string;
}

export const DashboardClient: FC<DashboardClientProps> = ({ userName = '' }) => {
  const [activeTab, setActiveTab] = useState<'consumption' | 'products'>('consumption');

  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
            <p className="text-gray-600 mt-1">Track your nutrition and reach your goals</p>
          </div>
          <div className="flex gap-3">
            <Link href="/goals">
              <Button variant="secondary">Set Goals</Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary">View History</Button>
            </Link>
            <Button variant="destructive" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>
        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'consumption' | 'products')}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="consumption" className="flex-1">
              Add Consumption
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1">
              Manage Products
            </TabsTrigger>
          </TabsList>
          <TabsContent value="consumption">
            <div className="space-y-6">
              <ConsumptionForm />
            </div>
          </TabsContent>
          <TabsContent value="products">
            <div className="space-y-6">
              <ProductForm />
              <ProductList />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

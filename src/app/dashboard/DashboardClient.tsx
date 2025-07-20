'use client';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import Link from 'next/link';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ConsumptionForm from './ConsumptionForm';

interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'consumption' | 'products'>('consumption');

  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session.user?.name || session.user?.email}!
            </h1>
            <p className="text-gray-600 mt-1">Track your nutrition and reach your goals</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/history"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              View History
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('consumption')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'consumption'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Consumption
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage Products
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'consumption' && (
        <div className="space-y-6">
          <ConsumptionForm />
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <ProductForm />
          <ProductList />
        </div>
      )}
    </div>
  );
}

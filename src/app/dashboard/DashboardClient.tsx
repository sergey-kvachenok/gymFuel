'use client';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ConsumptionForm from './ConsumptionForm';

export default function DashboardClient({ session }: { session: Session | null }) {
  if (!session) {
    return <div className="flex min-h-screen items-center justify-center">Please login</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, {session.user?.name || session.user?.email}!
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Logout
            </button>
          </div>
          <div className="text-gray-600">
            Track your nutrition and build muscle with custom products.
          </div>
        </div>

        {/* Consumption Form */}
        <ConsumptionForm />

        {/* Add Product Form */}
        <ProductForm />

        {/* Products List */}
        <ProductList />
      </div>
    </div>
  );
}

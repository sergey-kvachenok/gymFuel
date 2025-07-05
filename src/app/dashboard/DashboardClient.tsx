'use client';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

export default function DashboardClient({ session }: { session: Session | null }) {
  if (!session) {
    return <div className="flex min-h-screen items-center justify-center">Please login</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col items-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl border mb-8">
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
        <div className="text-gray-600 mb-4">
          This is your dashboard. Soon you&apos;ll see your nutrition stats, products and history
          here.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 rounded-xl p-6 text-center text-gray-500">
            Day stats (coming soon)
          </div>
          <div className="bg-pink-50 rounded-xl p-6 text-center text-gray-500">
            Product list (coming soon)
          </div>
          <div className="bg-green-50 rounded-xl p-6 text-center text-gray-500 md:col-span-2">
            History (coming soon)
          </div>
        </div>
      </div>
    </div>
  );
}

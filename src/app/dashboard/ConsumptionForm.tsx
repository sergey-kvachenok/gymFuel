'use client';
import { useState } from 'react';
import { trpc } from '../../lib/trpc-client';

export default function ConsumptionForm() {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const { data: products } = trpc.product.getAll.useQuery();
  const utils = trpc.useUtils();

  const createConsumption = trpc.consumption.create.useMutation({
    onSuccess: () => {
      // Обновляем статистику и список потреблений
      utils.consumption.getDailyStats.invalidate();
      utils.consumption.getByDate.invalidate();
      // Очищаем форму
      setSelectedProductId('');
      setAmount('');
      setError('');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const productId = parseInt(selectedProductId);
    const amountNum = parseFloat(amount);

    if (!productId || isNaN(amountNum) || amountNum <= 0) {
      setError('Please select a product and enter a valid amount');
      return;
    }

    createConsumption.mutate({
      productId,
      amount: amountNum,
    });
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Add to Today&apos;s Meals</h2>
        <div className="text-gray-500 text-center py-8">
          No products available. Add some products first to track your consumption.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <h2 className="text-xl font-bold mb-4">Add to Today&apos;s Meals</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.calories} cal/100g)
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            step="0.1"
            placeholder="Amount in grams"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          type="submit"
          disabled={createConsumption.isPending}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
        >
          {createConsumption.isPending ? 'Adding...' : 'Add to Meals'}
        </button>
      </form>
    </div>
  );
}

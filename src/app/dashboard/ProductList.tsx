'use client';
import { trpc } from '../../lib/trpc-client';

export default function ProductList() {
  const { data: products, isLoading, error } = trpc.product.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Your Products</h2>
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Your Products</h2>
        <div className="text-red-500">Error loading products: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <h2 className="text-xl font-bold mb-4">Your Products</h2>

      {!products || products.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No products yet. Add your first product above!
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <div className="text-sm text-gray-600">
                  Per 100g: {product.calories} cal | P: {product.protein}g | F: {product.fat}g | C:{' '}
                  {product.carbs}g
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

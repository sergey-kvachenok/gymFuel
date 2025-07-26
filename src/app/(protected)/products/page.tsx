import ProductList from './ProductList';

export default function ProductsPage() {
  return (
    <div className="max-w-[800px] mx-auto w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Products</h1>
      <ProductList />
    </div>
  );
}

'use client';
import { useState, FC } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export type ProductOption = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

interface ProductSearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  productCount?: number;
}

export const ProductSearch: FC<ProductSearchProps> = ({
  onSearchChange,
  placeholder = 'Search products...',
  className = '',
  isLoading = false,
  productCount = 0,
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {search && (
        <div className="mt-2 text-sm text-gray-500">
          {isLoading ? (
            <span>Searching...</span>
          ) : (
            <span>
              {productCount} {productCount === 1 ? 'product' : 'products'} found
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;

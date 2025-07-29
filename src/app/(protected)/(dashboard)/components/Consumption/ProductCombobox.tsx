'use client';
import { useState, useRef, useEffect, FC } from 'react';
import MacroInfo from '../../../../../components/ui/MacroInfo';
import { X } from 'lucide-react';
import { NutrientsTooltip } from './NutrientsTooltip';
import ProductSearch from '@/components/ProductSearch';
import { useProductSearch } from '../../../../../hooks/use-product-search';

export type ProductOption = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

type ProductComboboxProps = {
  value: ProductOption | null;
  onChange: (product: ProductOption | null) => void;
  disabled?: boolean;
};

export const ProductCombobox: FC<ProductComboboxProps> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    setSearchQuery,
    products = [],
    isLoading,
  } = useProductSearch({
    orderBy: 'name',
    orderDirection: 'asc',
  });

  const clear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded-md bg-white text-left ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400'
        }`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-bold m-0 flex-1">
              {value ? `${value.name} (${value.calories} cal/100g)` : 'Select a product...'}
            </p>

            {value && (
              <button
                type="button"
                onClick={clear}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                disabled={disabled}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
          {value && (
            <MacroInfo
              calories={value.calories}
              protein={value.protein}
              fat={value.fat}
              carbs={value.carbs}
              textSize="xs"
            />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 mt-1 p-2">
          <ProductSearch
            onSearchChange={setSearchQuery}
            placeholder="Search product..."
            className="mb-2"
          />

          <ul className="max-h-[100px] sm:max-h-[200px] overflow-y-auto px-2">
            {isLoading && <div className="text-center text-gray-500 text-sm">Loading...</div>}

            {!isLoading && products.length === 0 && (
              <div className="text-center text-gray-500 text-sm">No products found.</div>
            )}

            {!isLoading &&
              products.map((product, index) => (
                <li
                  key={product.id}
                  onClick={() => {
                    onChange(product);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className={`${index === products.length - 1 ? '' : 'border-b'} border-gray-100 py-1.5 sm:py-2 cursor-pointer flex justify-between items-center text-sm min-h-[32px] sm:min-h-[40px] hover:bg-gray-50 transition-colors`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      <span className="text-xs sm:text-sm">
                        {product.name} ({product.calories} cal/100g)
                      </span>
                      <NutrientsTooltip
                        protein={product.protein}
                        fat={product.fat}
                        carbs={product.carbs}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      <span className="text-[10px] sm:text-xs">
                        Protein: {product.protein}g | Fat: {product.fat}g | Carbs: {product.carbs}g
                      </span>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

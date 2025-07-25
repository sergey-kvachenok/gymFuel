'use client';
import { useState, useRef, useLayoutEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc-client';
import MacroInfo from './MacroInfo';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

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
  onChange: (product: ProductOption) => void;
  disabled?: boolean;
};

const ProductCombobox = ({ value, onChange, disabled }: ProductComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const { data: products = [], isLoading } = trpc.product.search.useQuery({ query: debounced });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="w-full h-full justify-between !px-2 !py-2 flex flex-col items-start gap-1"
          disabled={disabled}
        >
          <p className="text-sm text-gray-700 font-bold">
            {value ? `${value.name} (${value.calories} cal/100g)` : 'Select a product...'}
          </p>

          {value && (
            <MacroInfo
              calories={value.calories}
              protein={value.protein}
              fat={value.fat}
              carbs={value.carbs}
              textSize="xs"
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        style={triggerWidth ? { width: triggerWidth } : {}}
        className="min-w-[200px] max-w-full p-0"
      >
        <Command shouldFilter={false} className="w-full">
          <CommandInput
            placeholder="Search product..."
            value={search}
            onValueChange={setSearch}
            disabled={disabled}
            className="w-full"
          />
          <CommandList className="w-full">
            <CommandEmpty>No products found.</CommandEmpty>
            {isLoading && (
              <div className="p-2 text-center text-gray-500 text-sm w-full">Loading...</div>
            )}
            {products.map((product) => (
              <div key={product.id} className="w-full">
                <div className="flex items-center justify-between w-full">
                  <CommandItem
                    value={product.id.toString()}
                    onSelect={() => {
                      onChange(product);
                      setOpen(false);
                    }}
                    className="flex-1"
                  >
                    <p>
                      {product.name} ({product.calories} cal/100g)
                    </p>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-3 w-3 text-gray-400 cursor-help ml-2 flex items-center justify-center"
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                          >
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>

                        <TooltipContent className="bg-red-400 text-white !px-3 !py-2 border-none [&_.bg-primary]:!bg-red-400 [&_.fill-primary]:!fill-red-400">
                          {`Protein: ${product.protein}g | Fat: ${product.fat}g | Carbs: ${product.carbs}g`}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CommandItem>
                </div>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ProductCombobox;

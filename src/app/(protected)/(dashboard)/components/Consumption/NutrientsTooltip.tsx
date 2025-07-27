import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { FC, memo } from 'react';

interface INutrientsTooltipProps {
  protein: number;
  fat: number;
  carbs: number;
  className?: string;
}

export const NutrientsTooltip: FC<INutrientsTooltipProps> = memo(
  ({ protein, fat, carbs, className }) => {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'h-3 w-3 text-gray-400 cursor-help flex items-center justify-center',
                className,
              )}
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
            {`Protein: ${protein}g | Fat: ${fat}g | Carbs: ${carbs}g`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

NutrientsTooltip.displayName = 'NutrientsTooltip';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-destructive/20',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring',
        ghost:
          'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring',
      },
      size: {
        default: 'h-10 !px-6 !py-3 has-[>svg]:!px-4',
        sm: 'h-8 rounded-md gap-1.5 !px-4 !py-2 has-[>svg]:!px-3',
        lg: 'h-12 rounded-md !px-8 !py-4 has-[>svg]:!px-6',
        icon: 'size-9 !p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

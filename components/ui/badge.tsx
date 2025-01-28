import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border capitalize px-4 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        success:
          'border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80',
        warning:
          'border-transparent bg-yellow-500 text-primary-foreground shadow hover:bg-yellow-500/80',
        destructiveAccent:
          'border-transparent bg-destructive/20 text-destructive-500 shadow hover:bg-destructive/30',
        successAccent:
          'border-transparent bg-emerald-500/20 text-emerald-500 shadow hover:bg-emerald-500/30',
        warningAccent:
          'border-transparent  bg-yellow-500/20 text-yellow-500 shadow hover:bg-yellow-500/30',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

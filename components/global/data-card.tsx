import { VariantProps, cva } from 'class-variance-authority';
import { NextPage } from 'next';
import { IconType } from 'react-icons/lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { Countup } from './count-up';
import { Skeleton } from '../ui/skeleton';

const boxVariant = cva('rounded-md p-3', {
  variants: {
    variant: {
      default: 'bg-blue-500/20',
      success: 'bg-emerald-500/20',
      danger: 'bg-rose-500/20',
      warning: 'bg-yellow-500/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const iconVariant = cva('size-6', {
  variants: {
    variant: {
      default: 'text-blue-500',
      success: 'text-emerald-500',
      danger: 'text-rose-500',
      warning: 'text-yellow-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface DataCardProps extends VariantProps<typeof boxVariant>, VariantProps<typeof iconVariant> {
  title: string;
  value?: number;
  percentageChange?: number;
  icon: IconType;
  dataRange: string;
}

const DataCard: NextPage<DataCardProps> = ({
  title,
  value = 0,
  percentageChange = 0,
  icon: Icon,
  variant,
  dataRange,
}) => {
  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader className="flex  flex-col sm:flex-row items-center justify-between gap-x-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-medium line-clamp-1">{title}</CardTitle>
          <CardDescription className="text-sm line-clamp-1">{dataRange}</CardDescription>
        </div>
        <div className={cn('shrink-0', boxVariant({ variant }))}>
          <Icon className={cn(iconVariant({ variant }), 'shrink-0')} />
        </div>
      </CardHeader>
      <CardContent>
        <h1 className="font-bold text-2xl mb-2 line-clamp-1">
          <Countup
            preserveValue
            start={0}
            decimals={2}
            decimalPlaces={2}
            formattingFn={formatCurrency}
            end={value}
          />
        </h1>
        <p
          className={cn(
            'text-muted-foreground line-clamp-1 text-sm',
            percentageChange < 0 && 'text-rose-500',
            percentageChange > 0 && 'text-emerald-500'
          )}
        >
          {formatPercentage(percentageChange)} from last period
        </p>
      </CardContent>
    </Card>
  );
};

export default DataCard;

export const DataCardLoading = () => {
  return (
    <Card className="border border-primary drop-shadow-sm h-[192px]">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-x-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Skeleton className=" size-12" />
      </CardHeader>
      <CardContent>
        <Skeleton className="shrink-0 h-10 w-24 mb-2" />
        <Skeleton className="shrink-0 h-4 w-40" />
      </CardContent>
    </Card>
  );
};

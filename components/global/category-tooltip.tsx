import { Separator } from '../ui/separator';
import { formatCurrency } from '@/lib/utils';

interface Props {
  active?: boolean;
  payload: any;
  isIncome: boolean;
}

const CategoryTooltip = ({ active, payload, isIncome }: Props) => {
  if (!active) return null;

  const name = payload[0].payload.name;
  const value = payload[0].payload.value;
  return (
    <div className="rounded-sm bg-background shadow-sm border overflow-hidden">
      <div className="text-md px-2 py-1">{name}</div>
      <Separator />

      <div className="p-2 px-3 space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            {isIncome ? (
              <div className="size-1.5 bg-green-500 rounded-full" />
            ) : (
              <div className="size-1.5 bg-rose-500 rounded-full" />
            )}
            <p className="text-sm text-slate-700 dark:text-slate-500">
              {isIncome ? 'Income' : 'Expenses'}
            </p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500 font-medium">
            {formatCurrency(value * -1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryTooltip;

import { format } from 'date-fns';
import { NextPage } from 'next';
import { Separator } from '../ui/separator';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip: NextPage = ({ active, payload }: any) => {
  if (!active) return null;
  if (!payload || payload.length === 0) return null;

  const date = payload[0]?.payload?.date;
  const income = payload[0]?.payload?.income;
  const expenses = payload[1]?.payload?.expenses;
  return (
    <div className="rounded-sm bg-background shadow-sm border overflow-hidden">
      <div className="text-md px-3">{format(date, 'MMM dd, yyyy')}</div>
      <Separator />

      <div className="p-2 px-3 space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 bg-blue-500 rounded-full" />
            <p className="text-sm text-slate-700 dark:text-slate-500">Income</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500  font-medium">
            {formatCurrency(income)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 bg-rose-500 rounded-full" />
            <p className="text-sm text-slate-700 dark:text-slate-500">Expenses</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500 font-medium">
            {formatCurrency(expenses * -1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;

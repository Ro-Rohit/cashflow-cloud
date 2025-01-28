import { format } from 'date-fns';
import { NextPage } from 'next';
import { Separator } from '../ui/separator';
import { formatCurrency } from '@/lib/utils';

interface Props {
  active?: boolean;
  payload: any;
  isIncome: boolean;
}

const TopTransactionTooltip: NextPage<Props> = ({ active, payload, isIncome }) => {
  if (!active) return null;

  const date = payload[0].payload.date;
  const amount = payload[0].payload.amount;
  const payee = payload[0].payload.payee;
  return (
    <div className="rounded-sm bg-background shadow-sm border overflow-hidden">
      <div className="text-md px-3">{format(date, 'MMM dd, yyyy')}</div>
      <Separator />

      <div className="p-2 px-3 space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 bg-blue-500 rounded-full" />
            <p className="text-sm text-slate-700 dark:text-slate-500">Payee</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500  font-medium">
            {payee}
          </p>
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            {isIncome ? (
              <div className="size-1.5 bg-green-500 rounded-full" />
            ) : (
              <div className="size-1.5 bg-rose-500 rounded-full" />
            )}
            <p className="text-sm text-slate-700 dark:text-slate-500">Amount</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500 font-medium">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopTransactionTooltip;

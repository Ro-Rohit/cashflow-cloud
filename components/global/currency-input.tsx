import { NextPage } from 'next';
import Input from 'react-currency-input-field';

interface Props {
  value: string;
  onChange: (value?: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  prefix?: string;
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const AmountInput: NextPage<Props> = ({ value, onChange, isDisabled, placeholder, prefix }) => {
  const onReverse = (value?: string) => {
    if (!value) return;
    const revNum = parseFloat(value) * -1;
    return revNum.toString();
  };
  const isExpense = parseFloat(value) < 0;
  const isIncome = parseFloat(value) > 0;
  const isNeutral = parseFloat(value) === 0 || !value;
  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                'bg-slate-400 hover:bg-slate-500  absolute top-[4px] left-1.5 rounded-md p-2 flex items-center justify-center transition',
                { 'bg-emerald-500 hover:bg-emerald-600': isIncome },
                { 'bg-rose-500 hover:bg-rose-600': isExpense }
              )}
              onClick={() => onChange(onReverse(value))}
            >
              {isIncome && <Plus className="size-3 text-white" />}
              {isExpense && <Minus className="size-3 text-white" />}
              {isNeutral && <Info className="size-3 text-white" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>[+] for income, [-] for expense</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Input
        disabled={isDisabled}
        required
        className=" pl-10  flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        prefix={prefix}
        placeholder={placeholder}
        value={value}
        defaultValue={0.0}
        decimalsLimit={2}
        decimalScale={2}
        onValueChange={(value) => onChange(value)}
      />
      <p className="text-sm text-muted-foreground mt-1 dark:text-gray-50">
        {isIncome && 'This will count  as Income'}
        {isExpense && 'This will count  as Expense'}
      </p>
    </div>
  );
};

export default AmountInput;

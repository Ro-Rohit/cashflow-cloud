'use client';
import qs from 'query-string';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '../ui/popover';
import { DateRange } from 'react-day-picker';
import { Button } from '../ui/button';
import { formatDateRange } from '@/lib/utils';
import { subDays, format } from 'date-fns';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { LAST_30_DAYS } from '@/lib/const';

const DateFilter = () => {
  const params = useSearchParams();
  const to = params.get('to') || '';
  const from = params.get('from') || '';
  const accountId = params.get('accountId') || '';
  const router = useRouter();
  const pathname = usePathname();

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, LAST_30_DAYS);

  const paramState = {
    to: to ? new Date(to) : defaultTo,
    from: from ? new Date(from) : defaultFrom,
  };

  const [date, setDate] = useState<DateRange | undefined>();

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          to: format(dateRange?.to || defaultTo, 'yyyy-MM-dd'),
          from: format(dateRange?.from || defaultFrom, 'yyyy-MM-dd'),
          accountId,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger disabled={false} asChild>
        <Button
          variant={'outline'}
          size={'sm'}
          className="lg:w-auto h-9 rounded-md px-3 text-white hover:text-white bg-white/10 hover:bg-white/20 focus:bg-white/30 font-normal border-none focus:ring-offset-0 outline-none focus-visible:ring-transparent transition"
        >
          <span>{formatDateRange(paramState)}</span>
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="lg:auto w-full p-0" asChild>
        <div className="space-y-2">
          <Calendar
            defaultMonth={date?.from}
            disabled={false}
            mode="range"
            initialFocus
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <div>
            <PopoverClose asChild>
              <div className="flex items-center gap-x-2">
                <Button
                  disabled={!date?.from || !date.to}
                  onClick={onReset}
                  className="w-full"
                  variant={'outline'}
                >
                  Reset
                </Button>
                <Button onClick={() => pushToUrl(date)} className="w-full" variant={'outline'}>
                  Apply
                </Button>
              </div>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilter;

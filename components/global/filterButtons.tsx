import { Button } from '../ui/button';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '../ui/popover';
import { formatDateRange } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
import { ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { filterButton } from '@/lib/const';
import { toast } from 'sonner';
import { useState } from 'react';

interface Props {
  onFilter: ({ from, to }: { from: Date; to: Date }) => void;
  filterDates: {
    from: Date;
    to: Date;
  };
  btnIdxRef: any;
  onReset: () => void;
}

const FilterButtons = ({ onFilter, filterDates, onReset, btnIdxRef }: Props) => {
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const [date, setDate] = useState<Date[] | undefined>([filterDates.from, filterDates.to]);

  const handleReset = () => {
    onReset();
    setDate(undefined);
    btnIdxRef.current = undefined;
  };

  const handleFilterBtnClick = (item: any, idx: number) => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan  to filter data by date.');
      setPlanModalOpen(true);
      return;
    }
    if (btnIdxRef.current === idx) {
      setDate(undefined);
      btnIdxRef.current = undefined;
      onReset();
      return;
    } else if (date?.[0] !== item.from || date?.[1] !== item.to) {
      setDate([item.from, item.to]);
      onFilter(item);
      btnIdxRef.current = idx;
    }
  };

  const handleApply = () => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan  to filter data by date.');
      setPlanModalOpen(true);
      return;
    }

    if (!date || date.length !== 2) return;
    onFilter({
      from: date[0],
      to: date[1],
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      {filterButton.map((item, idx) => (
        <Badge
          key={idx}
          variant={btnIdxRef.current === idx ? 'successAccent' : 'warningAccent'}
          onClick={() => handleFilterBtnClick(item, idx)}
          className="rounded-2xl"
        >
          {item.label}
        </Badge>
      ))}
      <Popover>
        <PopoverTrigger disabled={false} asChild>
          <Button variant={'secondary'} size={'sm'} className="rounded-2xl">
            <span>{formatDateRange({ from: date?.[0], to: date?.[1] })}</span>
            <ChevronDown className="ml-2 size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="lg:auto w-full p-0" asChild>
          <div className="space-y-2">
            <Calendar
              defaultMonth={date?.[0]}
              disabled={{ after: new Date() }}
              mode="multiple"
              min={2}
              max={2}
              initialFocus
              selected={date}
              onSelect={(selectedDates) => {
                setDate(selectedDates);
                btnIdxRef.current = undefined;
              }}
            />
            <div>
              <PopoverClose asChild>
                <div className="flex items-center gap-x-2">
                  <Button
                    disabled={!date}
                    onClick={handleReset}
                    className="w-full"
                    variant={'outline'}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleApply} className="w-full" variant={'outline'}>
                    Apply
                  </Button>
                </div>
              </PopoverClose>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterButtons;

import { NextPage } from 'next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';

interface Props {
  yearArray: number[];
  onFilter: (value: number) => void;
  defaultValue: number;
  value: number;
}

const YearFilter: NextPage<Props> = ({ defaultValue, yearArray, value, onFilter }) => {
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const onValueChange = (value: string) => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan  to filter bills by year');
      setPlanModalOpen(true);
      return;
    }
    onFilter(parseInt(value));
  };

  return (
    <Select value={value.toString()} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto h-9 rounded-md px-3">
        <SelectValue placeholder="Select Year" defaultValue={defaultValue} />
      </SelectTrigger>
      <SelectContent className="px-1.5 max-h-[200px] overflow-y-auto">
        {yearArray?.map((item, idx) => (
          <SelectItem key={idx} value={item.toString()}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default YearFilter;

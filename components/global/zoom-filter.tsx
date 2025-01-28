'use client';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

type DateTruncType = 'day' | 'week' | 'month' | 'year';

interface Props {
  value: DateTruncType | undefined;
  chartZoomLevel?: DateTruncType[];
  handleFilter: (value: DateTruncType | undefined) => void;
}

const zoomFilter = ({ chartZoomLevel, handleFilter, value }: Props) => {
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();

  const handleValueChange = (value: DateTruncType | undefined) => {
    // if (plan === 'free') {
    //   toast.info('Please upgrade  your plan  to import transactions');
    //   setPlanModalOpen(true);
    //   return;
    // }
    handleFilter(value);
  };

  return (
    <Select
      value={value}
      onValueChange={(value) => handleValueChange(value as DateTruncType | undefined)}
    >
      <SelectTrigger className="sm:w-auto h-9 rounded-md px-3">
        <SelectValue placeholder="Select Zoom Level" defaultValue={chartZoomLevel?.[0]} />
      </SelectTrigger>
      <SelectContent className="px-1.5 max-h-[200px] overflow-y-auto">
        {chartZoomLevel?.map((item, idx) => (
          <SelectItem key={idx} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default zoomFilter;

'use client';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { SelectValue } from '@radix-ui/react-select';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  onFilter: (value: number) => void;
  defaultValue: number;
}

const TopFilter = ({ onFilter, defaultValue }: Props) => {
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const rankData = useMemo(
    () => [
      { name: 'Top 3', value: '3' },
      { name: 'Top 5', value: '5' },
      { name: 'Top 7', value: '7' },
      { name: 'Top 9', value: '9' },
      { name: 'Top 10', value: '10' },
    ],
    []
  );

  const [rank, setRank] = useState(defaultValue);
  const onRankChange = (value: string) => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan  to filter data');
      setPlanModalOpen(true);
      return;
    }
    onFilter(parseInt(value));
    setRank(parseInt(value));
  };
  return (
    <Select defaultValue={rank.toString()} value={rank.toString()} onValueChange={onRankChange}>
      <SelectTrigger className="w-auto h-9 rounded-md px-3">
        <SelectValue placeholder="Select Chart Type" />
      </SelectTrigger>
      <SelectContent>
        {rankData.map((item, idx) => (
          <SelectItem value={item.value} key={idx}>
            <div className="flex items-center">
              <p className="line-clamp-1">{item.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TopFilter;

'use client';
import { useEffect, useMemo, useState } from 'react';
import { MultiSelect } from '../ui/multi-select';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { toast } from 'sonner';

interface CategoryType {
  name: string;
  income: number;
  expense: number;
  budget: number;
}

interface Props {
  onFilter: (value: string[]) => void;
  categoryData?: CategoryType[];
}

const DEBOUNCE_DELAY = 1000;

const CategoryFilter = ({ onFilter, categoryData }: Props) => {
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const options = useMemo(
    () =>
      categoryData?.map((item) => ({
        label: item.name,
        value: item.name,
      })) || [],
    [categoryData]
  );

  const [categories, setCategories] = useState(
    categoryData?.slice(0, 5).map((item) => item.name) || []
  );

  // Debounce logic: Update `debouncedCategories` only after a delay
  const [debouncedCategories, setDebouncedCategories] = useState<string[]>(categories);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategories(categories);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler); // Cleanup on unmount or when `categories` changes
  }, [categories]);

  // Trigger `onFilter` whenever `debouncedCategories` changes
  useEffect(() => {
    onFilter(debouncedCategories);
  }, [debouncedCategories, onFilter]);

  // Handle value change
  const handleValueChange = (values: string[]) => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan  to filter data by categories');
      setPlanModalOpen(true);
      return;
    }
    setCategories(values);
  };

  // Handle Apply
  const handleApply = (values: string[]) => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan to filter data by categories');
      setPlanModalOpen(true);
      return;
    }
    onFilter(values);
  };

  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount) return null;

  return (
    <MultiSelect
      className="w-auto"
      options={options}
      onValueChange={handleValueChange}
      defaultValue={categories}
      placeholder="Select categories"
      variant="inverted"
      animation={2}
      maxCount={3}
      asChild
      onApply={handleApply}
    />
  );
};

export default CategoryFilter;

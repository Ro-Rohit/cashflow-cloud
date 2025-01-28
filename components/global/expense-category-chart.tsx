'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileSearch, Loader2, PieChart, Radar, Target } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import RadarVariant from './radar-variant';
import RadialVariant from './radial-variant';
import PieVariant from './pie-variant';
import { Skeleton } from '../ui/skeleton';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { toast } from 'sonner';
import { useGetTopExpenseCategories } from '@/features/summary/actions';
import { useSearchParams } from 'next/navigation';
import { format, subDays } from 'date-fns';
import FilterButtons from './filterButtons';
import TopFilter from './top-filter';
import { LAST_30_DAYS } from '@/lib/const';
import { isValidDate } from '../../lib/utils';

enum CHART_TYPE {
  PIE = 'pie',
  RADAR = 'radar',
  RADIAL = 'radial',
}

type DateFilterType = {
  from: Date;
  to: Date;
};

const ExpenseCategoryChart = () => {
  const [chartType, setChartType] = useState(CHART_TYPE.PIE);
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();
  const onTypeChange = (type: CHART_TYPE) => {
    if (plan === 'free') {
      setPlanModalOpen(true);
      toast.info('Please upgrade  your plan to see other charts');
    } else {
      setChartType(type);
    }
  };

  const query = useSearchParams();
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, LAST_30_DAYS);

  const to = query.get('to');
  const from = query.get('from');

  const paramState = {
    to: isValidDate(to) ? new Date(to as string) : defaultTo,
    from: isValidDate(from) ? new Date(from as string) : defaultFrom,
  };

  const [datefilter, setDateFilters] = useState<DateFilterType>(paramState);
  const [rank, setRank] = useState<number>(5);
  const btnIdxRef = useRef<number | undefined>();

  useEffect(() => {
    if (to || from) {
      setDateFilters((prev) => ({
        from: isValidDate(from) ? new Date(from as string) : prev.from,
        to: isValidDate(to) ? new Date(to as string) : prev.to,
      }));
    }
  }, [to, from]);

  const { data, isLoading, isError } = useGetTopExpenseCategories({
    from: format(datefilter.from, 'yyyy-MM-dd'),
    to: format(datefilter.to, 'yyyy-MM-dd'),
  });

  const onDateFilterChange = useCallback((newDateFilter: DateFilterType) => {
    setDateFilters(newDateFilter);
  }, []);

  const topExpenseCategories = data?.topExpenseCategories || [];
  const chartDataByRank = useMemo(() => {
    if (!topExpenseCategories.length) return [];

    const topCategories = topExpenseCategories.slice(0, rank - 1);
    const otherCategories = topExpenseCategories.slice(rank - 1);
    const otherSumExpense = otherCategories.reduce((acc: number, curr: any) => acc + curr.value, 0);
    if (otherCategories.length > 0) {
      topCategories.push({ name: 'Other', value: otherSumExpense });
    }
    return topCategories;
  }, [rank, topExpenseCategories]);

  if (isLoading || isError) return <ChartSkeleton isLoading={isLoading} isError={isError} />;

  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader>
        <div className="flex flex-col justify-center sm:flex-row items-center sm:justify-between gap-y-2 mb-4">
          <CardTitle className="text-lg text-center sm:text-left">Expense Categories</CardTitle>
          <div className="flex items-center flex-row gap-x-3">
            <TopFilter onFilter={setRank} defaultValue={rank} />
            <Select defaultValue={chartType} value={chartType} onValueChange={onTypeChange}>
              <SelectTrigger className="sm:w-auto h-9 rounded-md px-3">
                <SelectValue placeholder="Select Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CHART_TYPE.PIE}>
                  <div className="flex items-center">
                    <PieChart className="size-4 mr-2 shrink-0" />
                    <p className="line-clamp-1">Pie Chart</p>
                  </div>
                </SelectItem>
                <SelectItem value={CHART_TYPE.RADAR}>
                  <div className="flex items-center">
                    <Radar className="size-4 mr-2 shrink-0" />
                    <p className="line-clamp-1">Radar Chart</p>
                  </div>
                </SelectItem>

                <SelectItem value={CHART_TYPE.RADIAL}>
                  <div className="flex items-center">
                    <Target className="size-4 mr-2 shrink-0" />
                    <p className="line-clamp-1">Radial Chart</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <FilterButtons
          onFilter={onDateFilterChange}
          filterDates={datefilter}
          btnIdxRef={btnIdxRef}
          onReset={() => onDateFilterChange(paramState)}
        />
      </CardHeader>
      <CardContent>
        {!chartDataByRank.length ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No data for this period</p>
          </div>
        ) : (
          <>
            <Suspense fallback={<Loader2 className="animate-spin size-6 text-slate-300" />}>
              {chartType === CHART_TYPE.PIE && (
                <PieVariant data={chartDataByRank} isIncome={false} />
              )}
              {chartType === CHART_TYPE.RADAR && <RadarVariant data={chartDataByRank} />}
              {chartType === CHART_TYPE.RADIAL && <RadialVariant data={chartDataByRank} />}
            </Suspense>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryChart;

const ChartSkeleton = ({ isLoading, isError }: any) => {
  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center  justify-between gap-y-2 lg:gap-y-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 lg:w-[120px]  w-full" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full flex items-center justify-center">
          {isLoading && <Loader2 className="animate-spin size-6 text-slate-300" />}
          {isError && (
            <p className="text-sm text-muted-foreground">Something went wrong. Try again later.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

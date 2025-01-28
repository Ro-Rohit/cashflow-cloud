'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileSearch, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetCategoriesBudget } from '@/features/summary/actions';
import { Skeleton } from '../ui/skeleton';
import FilterButtons from './filterButtons';
import CategoryFilter from './category-filter';
import CategoriesBudgetAreaVariant from './categories-budget-area-variant';
import CategoriesBudgetBarVariant from './categoryBudget-bar-variant';
import ChartFilter, { CHART_TYPE } from './chart-filter';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { toast } from 'sonner';
import CategoriesBudgetLineVariant from './categories-budget-line-variant';
import { LAST_30_DAYS } from '@/lib/const';
import { isValidDate } from '@/lib/utils';

type DateFilterType = {
  from: Date;
  to: Date;
};

const CategoriesBudgetChart = () => {
  const [chartType, setChartType] = useState(CHART_TYPE.AREA);
  const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();

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
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const btnIdxRef = useRef<number | undefined>(); // Use a ref to store the active index

  const {
    data: categoryBudgetData,
    isLoading,
    isError,
  } = useGetCategoriesBudget({
    from: format(datefilter.from, 'yyyy-MM-dd'),
    to: format(datefilter.to, 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (to || from) {
      setDateFilters((prev) => ({
        from: isValidDate(from) ? new Date(from as string) : prev.from,
        to: isValidDate(to) ? new Date(to as string) : prev.to,
      }));
    }
  }, [to, from]);

  const categoriesBudget = categoryBudgetData?.categoriesBudget || [];
  const filteredChartData = useMemo(() => {
    if (!categoriesBudget.length) return undefined;
    if (!categoryFilter?.length) return categoriesBudget;
    return categoriesBudget.filter((item) => categoryFilter.includes(item.name));
  }, [categoriesBudget, categoryFilter]);

  const onCategoryFilterChange = useCallback((newCategoryFilter: string[]) => {
    setCategoryFilter(newCategoryFilter);
  }, []);

  const onDateFilterChange = useCallback((newDateFilter: DateFilterType) => {
    setDateFilters(newDateFilter);
  }, []);

  const onTypeChange = useCallback(
    (value: CHART_TYPE) => {
      if (plan === 'free') {
        setPlanModalOpen(true);
        toast.info('Please upgrade your plan to see this chart');
      } else {
        setChartType(value);
      }
    },
    [plan, setPlanModalOpen]
  );

  if (isLoading || isError) return <ChartSkeleton isLoading={isLoading} isError={isError} />;

  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center  justify-between gap-y-2 sm:gap-y-0">
          <div className="flex flex-row justify-between items-center w-full sm:max-w-[300px] gap-x-2">
            <CardTitle className="min-w-fit">Budget Analysis</CardTitle>
            <ChartFilter defaultValue={chartType} value={chartType} onFilter={onTypeChange} />
          </div>
          <CategoryFilter
            onFilter={onCategoryFilterChange}
            categoryData={categoryBudgetData?.categoriesBudget}
          />
        </div>
      </CardHeader>

      <FilterButtons
        onFilter={onDateFilterChange}
        filterDates={datefilter}
        btnIdxRef={btnIdxRef}
        onReset={() => onDateFilterChange(paramState)}
      />

      <CardContent>
        {!filteredChartData ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className=" size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No data for this period</p>
          </div>
        ) : (
          <>
            <Suspense fallback={<Loader2 className="animate-spin size-6 text-slate-300" />}>
              {chartType === CHART_TYPE.AREA && (
                <CategoriesBudgetAreaVariant data={filteredChartData} />
              )}
              {chartType === CHART_TYPE.BAR && (
                <CategoriesBudgetBarVariant data={filteredChartData} />
              )}
              {chartType === CHART_TYPE.LINE && (
                <CategoriesBudgetLineVariant data={filteredChartData} />
              )}
            </Suspense>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesBudgetChart;

const ChartSkeleton = ({ isLoading, isError }: any) => {
  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-y-2 lg:gap-y-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 lg:w-[120px] w-full" />
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

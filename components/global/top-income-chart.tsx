'use client';
import { format, subDays } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileSearch, Loader2 } from 'lucide-react';
import React, { useCallback, useMemo, useState, useRef, Suspense, useEffect } from 'react';
import { useGetTopIncomeTranactions } from '@/features/summary/actions';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import TopFilter from './top-filter';
import FilterButtons from './filterButtons';
import { LAST_30_DAYS } from '@/lib/const';
import { isValidDate } from '@/lib/utils';
import TopTransactionChart from './top-transansaction-chart';

type DateFilterType = {
  from: Date;
  to: Date;
};

const TopIncomeChart = () => {
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
  const [topRank, setTopRank] = useState<number>(5);
  const btnIdxRef = useRef<number | undefined>(); // Use a ref to store the active index

  useEffect(() => {
    if (to || from) {
      setDateFilters((prev) => ({
        from: isValidDate(from) ? new Date(from as string) : prev.from,
        to: isValidDate(to) ? new Date(to as string) : prev.to,
      }));
    }
  }, [to, from]);

  const {
    data: topIncomeData,
    isLoading,
    isError,
  } = useGetTopIncomeTranactions({
    from: format(datefilter.from, 'yyyy-MM-dd'),
    to: format(datefilter.to, 'yyyy-MM-dd'),
  });

  const topIncomes = topIncomeData?.topIncomes || [];
  const ChartDataByRank = useMemo(() => {
    if (!topIncomes.length) return undefined;
    return topIncomes.slice(0, topRank);
  }, [topRank, topIncomes]);

  const onDateFilterChange = useCallback((newDateFilter: DateFilterType) => {
    setDateFilters(newDateFilter);
  }, []);

  if (isLoading || isError) return <ChartSkeleton isLoading={isLoading} isError={isError} />;

  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-y-2 lg:gap-y-0">
        <div className="flex flex-row items-center  justify-between w-full lg:max-w-[300px]">
          <CardTitle className="text-xl ">Top Incomes</CardTitle>
          <TopFilter onFilter={setTopRank} defaultValue={topRank} />
        </div>
        <FilterButtons
          onFilter={onDateFilterChange}
          filterDates={datefilter}
          btnIdxRef={btnIdxRef}
          onReset={() => onDateFilterChange(paramState)}
        />
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Loader2 className="animate-spin size-6 text-slate-300" />}>
          {!ChartDataByRank ? (
            <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
              <FileSearch className=" size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No data for this period</p>
            </div>
          ) : (
            <>
              <TopTransactionChart data={ChartDataByRank} isIncome={true} />
            </>
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default TopIncomeChart;

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

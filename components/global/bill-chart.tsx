'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileSearch, Loader2 } from 'lucide-react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useGetBillsSummary } from '@/features/summary/actions';
import { Skeleton } from '../ui/skeleton';
import YearFilter from './year-filter';
import BillVariantChart from './bill-variant-chart';

const BillChart = () => {
  const { data: billSummaryData, isLoading, isError } = useGetBillsSummary();

  const [yearFilter, setYearFilter] = useState(() => new Date().getUTCFullYear());

  const filteredChartData = useMemo(() => {
    return billSummaryData?.billsData?.filter((item) => item.year === yearFilter) || [];
  }, [billSummaryData?.billsData, yearFilter]);

  const yearArray = useMemo(() => {
    return billSummaryData?.uniqueYears || [];
  }, [billSummaryData?.uniqueYears]);

  const onYearFilterChange = useCallback((newYearFilter: number) => {
    setYearFilter(newYearFilter);
  }, []);

  if (isLoading || isError || !billSummaryData)
    return <ChartSkeleton isLoading={isLoading} isError={isError} />;

  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader>
        <div className="flex flex-row items-center justify-between gap-y-3">
          <CardTitle className="text-lg ">Bills Analysis</CardTitle>
          <YearFilter
            onFilter={onYearFilterChange}
            yearArray={yearArray}
            value={yearFilter}
            defaultValue={yearFilter}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Loader2 className="animate-spin size-6 text-slate-300" />}>
          {filteredChartData.length > 0 ? (
            <BillVariantChart data={filteredChartData} />
          ) : (
            <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
              <FileSearch className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No data for this period</p>
            </div>
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default BillChart;

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

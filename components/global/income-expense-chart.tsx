'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileSearch, Loader2 } from 'lucide-react';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { toast } from 'sonner';
import ZoomFilter from './zoom-filter';
import FilterButtons from './filterButtons';
import { useGetActivePeriods } from '@/features/summary/actions';
import { format, subDays } from 'date-fns';
import AreaVariant from './area-variant';
import LineVariant from './line-variant';
import BarVariant from './bar-variant';
import { useSearchParams } from 'next/navigation';
import ChartFilter, { CHART_TYPE } from './chart-filter';
import { LAST_30_DAYS } from '@/lib/const';
import { isValidDate } from '@/lib/utils';

type DateTruncType = 'day' | 'week' | 'month' | 'year';
type DateFilterType = {
  from: Date;
  to: Date;
};

const IncomeExpenseChart = () => {
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
  const btnIdxRef = useRef<number | undefined>();

  useEffect(() => {
    if (to || from) {
      setDateFilters((prev) => ({
        from: isValidDate(from) ? new Date(from as string) : prev.from,
        to: isValidDate(to) ? new Date(to as string) : prev.to,
      }));
    }
  }, [to, from]);

  const {
    data: activeData,
    isLoading,
    isError,
  } = useGetActivePeriods({
    from: format(datefilter.from, 'yyyy-MM-dd'),
    to: format(datefilter.to, 'yyyy-MM-dd'),
  });

  const [dateTruncFilter, setDateTruncFilter] = useState<DateTruncType | undefined>();

  const activePeriods = activeData?.activePeriods || [];
  const chartZoomLevel = activeData?.chartZoomLevel || [];

  const getChartDataByTrunc = useMemo(() => {
    if (!activePeriods.length) return undefined;
    if (!dateTruncFilter) return activePeriods[0]?.activePeriodData || undefined;
    return (
      activePeriods.find((item) => item.dateTrunc === dateTruncFilter)?.activePeriodData ||
      undefined
    );
  }, [dateTruncFilter, activePeriods]);

  useEffect(() => {
    if (chartZoomLevel.length) {
      setDateTruncFilter(chartZoomLevel[0]);
    }
  }, [chartZoomLevel]);

  const onTypeChange = useCallback((type: CHART_TYPE) => {
    if (plan === 'free') {
      setPlanModalOpen(true);
      toast.info('Please upgrade your plan to see other charts');
    } else {
      setChartType(type);
    }
  }, []);
  const onDateFilterChange = useCallback(
    (newDateFilter: DateFilterType) => setDateFilters(newDateFilter),
    []
  );

  if (isLoading || isError) {
    return <ChartSkeleton isLoading={isLoading} isError={isError} />;
  }

  return (
    <Card className="border border-primary drop-shadow-sm">
      <CardHeader className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-y-2 sm:gap-y-0">
        <div className="flex justify-between lg:gap-x-6 items-center w-full lg:max-w-[300px]">
          <CardTitle className="text-lg">Transactions</CardTitle>
          <div className="flex flex-row gap-x-2">
            <ZoomFilter
              value={dateTruncFilter}
              chartZoomLevel={activeData?.chartZoomLevel}
              handleFilter={setDateTruncFilter}
            />
            <ChartFilter defaultValue={chartType} value={chartType} onFilter={onTypeChange} />
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
        <Suspense fallback={<Loader2 className="animate-spin size-6 text-slate-300" />}>
          {!getChartDataByTrunc || !getChartDataByTrunc.length ? (
            <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
              <FileSearch className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No data for this period</p>
            </div>
          ) : (
            <>
              {chartType === CHART_TYPE.AREA && <AreaVariant data={getChartDataByTrunc} />}
              {chartType === CHART_TYPE.LINE && <LineVariant data={getChartDataByTrunc} />}
              {chartType === CHART_TYPE.BAR && <BarVariant data={getChartDataByTrunc} />}
            </>
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
};

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

export default IncomeExpenseChart;

//   const { plan, setOpen: setPlanModalOpen } = useSubscriptionStore();

//   const query = useSearchParams();
//   const defaultTo = new Date();
//   const defaultFrom = subDays(defaultTo, LAST_30_DAYS);
//   const to = query.get('to');
//   const from = query.get('from');

//   const paramState = {
//     to: to ? new Date(to) : defaultTo,
//     from: from ? new Date(from) : defaultFrom,
//   };

//   const [datefilter, setDateFilters] = useState<DateFilterType>(paramState);
//   const btnIdxRef = useRef<number | undefined>(); // Use a ref to store the active index

//   const to = query.get('to');
//   useEffect(() => {
//     const from = query.get('from');
//     if (to || from) {
//       setDateFilters((prev) => ({
//         from: from ? new Date(from) : prev.from,
//         to: to ? new Date(to) : prev.to,
//       }));
//     }
//   }, [query]);

//   const {
//     data: activeData,
//     isLoading,
//     isError,
//   } = useGetActivePeriods({
//     from: format(datefilter.from, 'yyyy-MM-dd'),
//     to: format(datefilter.to, 'yyyy-MM-dd'),
//   });

//   const [dateTruncFilter, setDateTruncFilter] = useState<DateTruncType | undefined>();

//   const getChartDataByTrunc = useMemo(() => {
//     const periods = activeData?.activePeriods;

//     if (!Array.isArray(periods) || periods.length === 0) return undefined;

//     if (!dateTruncFilter) {
//       const firstData = periods[0]?.activePeriodData;
//       return firstData && firstData.length > 0 ? firstData : undefined;
//     }

//     const matchingPeriod = periods.find((item) => item.dateTrunc === dateTruncFilter);
//     const data = matchingPeriod?.activePeriodData;

//     return data && data.length > 0 ? data : undefined;
//   }, [dateTruncFilter, activeData?.activePeriods]);

//   useEffect(() => {
//     if (activeData?.chartZoomLevel) {
//       setDateTruncFilter(activeData?.chartZoomLevel[0]);
//     }
//   }, [activeData?.chartZoomLevel]);

//   const onTypeChange = useCallback(
//     (type: CHART_TYPE) => {
//
//       setChartType(type);
//     },
//     [plan, setPlanModalOpen]
//   );

//   const onDateFilterChange = useCallback((newDateFilter: DateFilterType) => {
//     setDateFilters(newDateFilter);
//   }, []);

//   if (isLoading || isError) {
//     return (
//
//     );
//   }

//   return (
//     <Card className="border border-primary drop-shadow-sm">
//
//       <CardContent>
//         {getChartDataByTrunc === undefined ? (
//
//         ) : (
//           <Suspense fallback={<Loader2 className="animate-spin size-6 text-slate-300" />}>
//             {chartType === CHART_TYPE.AREA && <AreaVariant data={getChartDataByTrunc} />}
//             {chartType === CHART_TYPE.LINE && <LineVariant data={getChartDataByTrunc} />}
//             {chartType === CHART_TYPE.BAR && <BarVariant data={getChartDataByTrunc} />}
//           </Suspense>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

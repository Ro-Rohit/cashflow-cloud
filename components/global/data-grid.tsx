'use client';
import { useGetSummary } from '@/features/summary/actions';
import { formatDateRange } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { FaPiggyBank } from 'react-icons/fa';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

import DataCard, { DataCardLoading } from './data-card';
import { useEffect, useState } from 'react';

const Datagrid = () => {
  const params = useSearchParams();
  const { data, isLoading } = useGetSummary();
  const to = params.get('to') || undefined;
  const from = params.get('from') || undefined;
  const [mount, setIsMount] = useState(false);

  const dateRangeLabel = formatDateRange({ to, from });

  useEffect(() => {
    setIsMount(true);
  }, []);

  if (isLoading || !mount) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={FaPiggyBank}
        variant="default"
        dataRange={dateRangeLabel}
      />

      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={FaArrowTrendUp}
        variant="success"
        dataRange={dateRangeLabel}
      />

      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={FaArrowTrendDown}
        variant="danger"
        dataRange={dateRangeLabel}
      />
    </div>
  );
};

export default Datagrid;

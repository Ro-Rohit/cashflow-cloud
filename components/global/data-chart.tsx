'use client';

import IncomeExpenseChart from './income-expense-chart';
import TopIncomeChart from './top-income-chart';
import TopExpenseChart from './top-expense-chart';
import IncomeCategoryChart from './income-category-chart';
import ExpenseCategoryChart from './expense-category-chart';
import CategoriesBudgetChart from './categories-budget-chart';
import BillChart from './bill-chart';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const DataChart = () => {
  const [mount, setIsMount] = useState(false);
  useEffect(() => {
    setIsMount(true);
  }, []);

  if (!mount) {
    return (
      <div className=" w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-6 text-slate-300" />
      </div>
    );
  }
  return (
    <section className="w-full space-y-5">
      <div className="w-full">
        <IncomeExpenseChart />
      </div>

      <div className="w-full">
        <TopIncomeChart />
      </div>

      <div className="w-full">
        <TopExpenseChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        <IncomeCategoryChart />
        <ExpenseCategoryChart />
      </div>

      <div className="w-full">
        <CategoriesBudgetChart />
      </div>

      <div className="w-full">
        <BillChart />
      </div>
    </section>
  );
};

export default DataChart;

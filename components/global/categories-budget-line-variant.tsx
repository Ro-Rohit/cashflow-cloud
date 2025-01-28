'use client';
import { NextPage } from 'next';

import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import CategoryBudgetTooltip from './category-budget-tooltip';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data?: {
    name: string;
    budget: number;
    income: number;
    expense: number;
  }[];
}

const CategoriesBudgetLineVariant: NextPage<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        className="w-full"
        height={400}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="category" dataKey="name" />
        <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          tickMargin={12}
          tickLine={false}
          style={{ fontSize: '12px' }}
        />
        <Line
          animationBegin={300}
          animationDuration={1500}
          type="monotone"
          dataKey="budget"
          stroke="#4CAF50"
          activeDot={{ r: 8 }}
        />

        {/* Income (Positive Values) */}
        <Line
          animationBegin={1000}
          animationDuration={1500}
          type="monotone"
          dataKey="income"
          stroke="#2196F3"
          activeDot={{ r: 8 }}
        />

        {/* Expense (Negative Values as Positive Bars) */}
        <Line
          animationBegin={1500}
          animationDuration={1500}
          type="monotone"
          dataKey="expense"
          stroke="#FF5722"
          activeDot={{ r: 8 }}
        />
        <Tooltip content={<CategoryBudgetTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CategoriesBudgetLineVariant;

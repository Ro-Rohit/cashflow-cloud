'use client';
import { NextPage } from 'next';

import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
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

const CategoriesBudgetBarVariant: NextPage<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        className="w-full"
        height={400}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <defs>
          <linearGradient id="budget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#4CAF50" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#3d82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3d82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#f43f53" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f43f53" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis type="category" dataKey="name" />
        <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          tickMargin={12}
          tickLine={false}
          style={{ fontSize: '12px' }}
        />
        <Bar
          type="monotone"
          strokeWidth={2}
          animationBegin={300}
          animationDuration={1500}
          dataKey="budget"
          fill={'url(#budget)'}
          name="Budget"
        />
        <Line
          animationBegin={300}
          animationDuration={1500}
          type="monotone"
          dataKey="budget"
          stroke="#4CAF50"
        />

        {/* Income (Positive Values) */}
        <Bar
          type="monotone"
          strokeWidth={2}
          animationBegin={1000}
          animationDuration={1500}
          dataKey="income"
          fill={'url(#income)'}
          name="Income"
        />
        <Line
          animationBegin={1000}
          animationDuration={1500}
          type="monotone"
          dataKey="income"
          stroke="#2196F3"
        />

        {/* Expense (Negative Values as Positive Bars) */}
        <Bar
          type="monotone"
          strokeWidth={2}
          animationBegin={1500}
          animationDuration={1500}
          dataKey="expense"
          fill={'url(#expense)'}
          name="Expense"
          barSize={20}
        />
        <Line
          animationBegin={1500}
          animationDuration={1500}
          type="monotone"
          dataKey="expense"
          stroke="#FF5722"
        />
        <Tooltip content={<CategoryBudgetTooltip />} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CategoriesBudgetBarVariant;

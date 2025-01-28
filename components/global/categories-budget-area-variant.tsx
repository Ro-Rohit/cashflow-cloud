'use client';
import { NextPage } from 'next';

import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
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

const CategoriesBudgetAreaVariant: NextPage<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width={'100%'} height={500}>
      <AreaChart className="w-full" height={500} data={data}>
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
        <XAxis
          dataKey="name"
          axisLine={false}
          tickMargin={16}
          style={{ fontSize: '12px' }}
          tickLine={false}
        />

        <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          tickMargin={12}
          tickLine={false}
          style={{ fontSize: '12px' }}
        />

        <Area
          type={'monotone'}
          strokeWidth={2}
          dataKey={'budget'}
          stackId={'budget'}
          stroke={'#4CAF50'}
          fill={'url(#budget)'}
          className="drop-shadow-sm"
        />

        <Area
          type={'monotone'}
          strokeWidth={2}
          dataKey={'income'}
          stackId={'income'}
          stroke={'#3d82f6'}
          fill={'url(#income)'}
          className="drop-shadow-sm"
        />
        <Area
          type={'monotone'}
          strokeWidth={2}
          dataKey={'expense'}
          stackId={'expense'}
          stroke={'#f43f53'}
          fill={'url(#expense)'}
          className="drop-shadow-sm"
        />
        <Tooltip content={<CategoryBudgetTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CategoriesBudgetAreaVariant;

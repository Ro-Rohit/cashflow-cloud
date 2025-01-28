'use client';
import { format } from 'date-fns';
import { NextPage } from 'next';
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './custom-tooltip';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
}

const AreaVariant: NextPage<Props> = ({ data = [] }) => {
  return (
    <ResponsiveContainer width={'100%'} height={500}>
      <AreaChart className="w-full" height={500} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#3d82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3d82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#f43f53" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f43f53" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickMargin={16}
          style={{ fontSize: '12px' }}
          tickLine={false}
          tickFormatter={(value) => format(value, 'dd MMM')}
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
          dataKey={'income'}
          stackId={'income'}
          stroke={'#3d82f6'}
          fill={'url(#income)'}
          className="drop-shadow-sm"
        />
        <Area
          type={'monotone'}
          strokeWidth={2}
          dataKey={'expenses'}
          stackId={'expenses'}
          stroke={'#f43f53'}
          fill={'url(#expenses)'}
          className="drop-shadow-sm"
        />
        <Tooltip content={<CustomTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaVariant;

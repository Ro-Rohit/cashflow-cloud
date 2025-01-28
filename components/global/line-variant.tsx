'use client';
import { format } from 'date-fns';
import { NextPage } from 'next';
import {
  XAxis,
  CartesianGrid,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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

const LineVariant: NextPage<Props> = ({ data = [] }) => {
  return (
    <ResponsiveContainer width={'100%'} height={500}>
      <LineChart data={data} className="w-full" height={500}>
        <CartesianGrid strokeDasharray={'3 3'} />
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
        <Line
          type={'monotone'}
          dot={false}
          strokeWidth={2}
          dataKey={'income'}
          stroke={'#3d82f6'}
          fill={'url(#income)'}
          className=" drop-shadow-sm"
        />
        <Line
          type={'monotone'}
          strokeWidth={2}
          dataKey={'expenses'}
          stroke={'#f43f53'}
          fill={'url(#expenses)'}
          className=" drop-shadow-sm"
          dot={false}
        />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineVariant;

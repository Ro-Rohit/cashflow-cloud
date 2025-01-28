'use client';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import TopTransactionTooltip from './top-transaction-tooltip';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data?: {
    payee: string;
    amount: number;
    date: string;
  }[];
  isIncome?: boolean;
}

const TopTransactionChart = ({ data = [], isIncome = true }: Props) => {
  return (
    <ResponsiveContainer height={500} width={'100%'}>
      <BarChart
        className="w-full"
        height={400}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
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
          axisLine={false}
          tickMargin={16}
          style={{ fontSize: '12px' }}
          tickLine={false}
          tickFormatter={(value) => format(value, 'dd MMM')}
          dataKey="date"
        />

        <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          tickMargin={12}
          tickLine={false}
          style={{ fontSize: '12px' }}
        />

        <Tooltip
          content={({ active, payload }) => (
            <TopTransactionTooltip active={active} payload={payload} isIncome={isIncome} />
          )}
          contentStyle={{
            backgroundColor: `${isIncome ? '#a2c4c9' : '#f4cccc'}`,
          }}
        />

        <Bar
          strokeWidth={2}
          type={'monotone'}
          stackId={isIncome ? 'income' : 'expenses'}
          dataKey="amount"
          fill={isIncome ? 'url(#income)' : 'url(#expenses)'}
          shape={<TriangleBar />}
          animationDuration={1500}
          label={{ position: 'top' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={isIncome ? 'url(#income)' : 'url(#expenses)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopTransactionChart;

const TriangleBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

const getPath = (x: number, y: number, width: number, height: number) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
      ${x + width / 2}, ${y}
      C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${
    y + height
  }
      Z`;
};

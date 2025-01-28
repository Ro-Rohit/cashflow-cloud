'use client';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  ZAxis,
} from 'recharts';

import { NextPage } from 'next';
import { Separator } from '../ui/separator';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Props {
  data?: {
    year: number;
    month: string;
    name: string;
    dueDate: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
  }[];
}

const BillVariantChart: NextPage<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <ScatterChart
        height={500}
        className="w-full"
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
          <linearGradient id="paid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#4CAF50" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#3d82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3d82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="overdue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#f43f53" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f43f53" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis dataKey="month" />
        <YAxis
          dataKey={'amount'}
          tickFormatter={(value) => formatCurrency(value)}
          tickMargin={12}
          tickLine={false}
          style={{ fontSize: '12px' }}
        />
        <ZAxis type="number" dataKey="amount" range={[60, 400]} />

        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<BillTooltip />} />
        <Scatter>
          {data?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.status === 'paid'
                  ? 'url(#paid)'
                  : entry.status === 'pending'
                  ? 'url(#pending)'
                  : 'url(#overdue)'
              }
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default BillVariantChart;

const BillTooltip = ({ active, payload }: any) => {
  if (!active) return null;
  if (!payload || payload.length === 0) return null;

  const dueDate = payload[0]?.payload?.dueDate;
  const amount = payload[0]?.payload?.amount;
  const status = payload[0]?.payload?.status;
  const name = payload[0]?.payload?.name;
  return (
    <div className="rounded-sm bg-background shadow-sm border overflow-hidden">
      <div className="text-md px-3">{format(dueDate, 'MMM dd, yyyy')}</div>
      <Separator />

      <div className="p-2 px-3 space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            {status === 'paid' && <div className="size-1.5 bg-emerald-500 rounded-full" />}
            {status === 'pending' && <div className="size-1.5 bg-blue-500 rounded-full" />}
            {status === 'overdue' && <div className="size-1.5 bg-rose-500 rounded-full" />}
            <p className="text-sm text-slate-700 dark:text-slate-500">Name</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500  font-medium">
            {name}
          </p>
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            {status === 'paid' && <div className="size-1.5 bg-emerald-500 rounded-full" />}
            {status === 'pending' && <div className="size-1.5 bg-blue-500 rounded-full" />}
            {status === 'overdue' && <div className="size-1.5 bg-rose-500 rounded-full" />}
            <p className="text-sm text-slate-700 dark:text-slate-500">Amount</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500  font-medium">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            {status === 'paid' && <div className="size-1.5 bg-emerald-500 rounded-full" />}
            {status === 'pending' && <div className="size-1.5 bg-blue-500 rounded-full" />}
            {status === 'overdue' && <div className="size-1.5 bg-rose-500 rounded-full" />}
            <p className="text-sm text-slate-700 dark:text-slate-500">Status</p>
          </div>
          <p className="text-sm text-right text-slate-700 dark:text-slate-500  font-medium">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

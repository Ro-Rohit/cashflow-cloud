'use client';
import { NextPage } from 'next';
import { Tooltip, ResponsiveContainer, PieChart, Legend, Pie, Cell } from 'recharts';
import { formatPercentage } from '@/lib/utils';
import CategoryTooltip from './category-tooltip';

interface Props {
  data: {
    name: string;
    value: number;
  }[];
  isIncome: boolean;
}

const PieVariant: NextPage<Props> = ({ data, isIncome }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <ResponsiveContainer
      width={'100%'}
      minHeight={500}
      maxHeight={900}
      className="h-auto min-h-[500px]"
    >
      <PieChart data={data} className="w-full h-fit min-h-[500px]">
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          content={({ payload }: any) => {
            return (
              <ul className="flex flex-col  space-y-2">
                {payload.map((entry: any, index: number) => (
                  <li key={index} className="flex items-center gap-x-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></span>

                    <div className="space-x-1">
                      <span className="text-sm text-slate-700 dark:text-muted-foreground">
                        {entry.value}
                      </span>

                      <span className="text-sm text-slate-700 dark:text-muted-foreground">
                        {formatPercentage(entry.payload.percent * 100)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }}
        />
        <Tooltip
          content={({ active, payload }: any) => (
            <CategoryTooltip isIncome={isIncome} active={active} payload={payload} />
          )}
        />

        <Pie
          data={data}
          cx={'50%'}
          cy={'50%'}
          innerRadius={70}
          outerRadius={100}
          fill="#8884db"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieVariant;

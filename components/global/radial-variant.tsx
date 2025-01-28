'use client';
import { NextPage } from 'next';
import { ResponsiveContainer, Legend, RadialBarChart, RadialBar } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

const RadialVariant: NextPage<Props> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <ResponsiveContainer width={'100%'} height={400}>
      <RadialBarChart
        cx={'50%'}
        cy={'50%'}
        barSize={10}
        innerRadius={'90%'}
        outerRadius={'40%'}
        data={data.map((item, idx) => ({ ...item, fill: COLORS[idx % COLORS.length] }))}
      >
        <RadialBar
          dataKey={'value'}
          background
          label={{ position: 'insideStart', fill: '#fff', fontSize: '12px' }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          content={({ payload }: any) => {
            return (
              <ul className="flex flex-col space-y-2">
                {payload.map((entry: any, index: number) => (
                  <li key={index} className="flex items-center gap-x-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></span>

                    <div className=" space-x-1">
                      <span className="text-sm text-muted-foreground">{entry.value}</span>

                      <span className="text-sm">{formatCurrency(entry.payload.value)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default RadialVariant;

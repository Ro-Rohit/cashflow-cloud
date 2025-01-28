'use client';
import { NextPage } from 'next';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

const RadarVariant: NextPage<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width={'100%'} className="h-fit min-h-[500px]">
      <RadarChart cx={'50%'} cy={'50%'} outerRadius={'60%'} data={data}>
        <PolarGrid />
        <PolarAngleAxis style={{ fontSize: '12px' }} dataKey={'name'} />
        <PolarRadiusAxis style={{ fontSize: '12px' }} />
        <Radar dataKey={'value'} stroke="#3b82f6" fill="#3b82f6" opacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarVariant;

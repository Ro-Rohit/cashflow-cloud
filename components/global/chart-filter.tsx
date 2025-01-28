import { NextPage } from 'next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AreaChart, BarChart, LineChart } from 'lucide-react';

export enum CHART_TYPE {
  AREA = 'area',
  LINE = 'line',
  BAR = 'bar',
}

interface Props {
  defaultValue: CHART_TYPE;
  value: CHART_TYPE;
  onFilter: (value: CHART_TYPE) => void;
}

const ChartFilter: NextPage<Props> = ({ defaultValue, value, onFilter }) => {
  return (
    <Select
      defaultValue={defaultValue}
      value={value}
      onValueChange={(value) => onFilter(value as CHART_TYPE)}
    >
      <SelectTrigger className="w-auto h-9 rounded-md px-3">
        <SelectValue placeholder="Select Chart Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CHART_TYPE.AREA}>
          <div className="flex items-center">
            <AreaChart className="size-4 mr-2 shrink-0" />
            <p className="line-clamp-1">Area Chart</p>
          </div>
        </SelectItem>
        <SelectItem value={CHART_TYPE.LINE}>
          <div className="flex items-center">
            <LineChart className="size-4 mr-2 shrink-0" />
            <p className="line-clamp-1">Line Chart</p>
          </div>
        </SelectItem>
        <SelectItem value={CHART_TYPE.BAR}>
          <div className="flex items-center">
            <BarChart className="size-4 mr-2 shrink-0" />
            <p className="line-clamp-1">Bar Chart</p>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ChartFilter;

import { NextPage } from 'next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  columnIndex: number;
  selectedColumn: Record<string, string | null>;
  onChange: (columnIdx: number, value: string | null) => void;
}

const options = ['amount', 'date', 'payee', 'notes', 'category'];

const TableHeadSelect: NextPage<Props> = ({ selectedColumn, columnIndex, onChange }) => {
  const currentSelection = selectedColumn[`column_${columnIndex}`];
  return (
    <Select
      value={currentSelection || 'Skip'}
      onValueChange={(value) => onChange(columnIndex, value)}
    >
      <SelectTrigger
        className={cn(
          'border-none outline-none bg-transparent focus:ring-offset-0 focus:ring-transparent capitalize',
          { 'text-sky-500': currentSelection }
        )}
      >
        <SelectValue placeholder="Skip" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={'Skip'} className="capitalize">
          Skip
        </SelectItem>
        {options.map((option, idx) => {
          const disabled =
            Object.values(selectedColumn).includes(option) &&
            selectedColumn[`column_${columnIndex}`] !== option;
          return (
            <SelectItem key={idx} disabled={disabled} className="capitalize" value={option}>
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default TableHeadSelect;

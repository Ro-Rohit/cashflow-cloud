import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CircleDotDashedIcon } from 'lucide-react';
import { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  disabled?: boolean;
  value?: string;
  onChange: (value?: string) => void;
}

const BillStatusDropdown: NextPage<Props> = ({ disabled, value, onChange }) => {
  const billStatusOption = useMemo(() => {
    return [
      { label: 'Pending', value: 'pending' },
      { label: 'Paid', value: 'paid' },
      { label: 'Overdue', value: 'overdue' },
    ];
  }, []);

  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled}
          variant={'outline'}
          className={cn(
            'w-full  justify-start text-left font-normal uppercase',
            !value && 'text-muted-foreground'
          )}
        >
          <CircleDotDashedIcon className=" size-4  mr-2" />
          {selectedValue || <span>Select Bill Status</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {billStatusOption.map((option, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={() => {
              setSelectedValue(option.value);
              onChange(option.value);
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BillStatusDropdown;

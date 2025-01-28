'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NextPage } from 'next';
import { Input } from '../ui/input';

interface Props {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

const DatePicker: NextPage<Props> = ({
  value,
  onChange,
  disabled,
  placeholder = 'Pick a date',
}: Props) => {
  const inputId = React.useId();

  // Hold the month in state to control the calendar when the input changes
  const [month, setMonth] = React.useState(new Date());

  // Hold the input value in state
  const [inputValue, setInputValue] = React.useState('');

  const handleDayPickerSelect = (date: Date | undefined) => {
    if (!date) {
      setInputValue('');
      onChange(undefined);
    } else {
      onChange(date);
      setMonth(date);
      setInputValue(format(date, 'MM/dd/yyyy'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // keep the input value in sync

    const parsedDate = parse(e.target.value, 'dd/MM/yyyy', new Date());

    if (isValid(parsedDate)) {
      onChange(parsedDate);
      setMonth(parsedDate);
    } else {
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={'outline'}
          className={cn(
            'w-full  justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className=" size-4  mr-2" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="w-full">
          <Input
            style={{ fontSize: 'inherit', textAlign: 'center' }}
            id={inputId}
            type="text"
            prefix="Date: "
            value={inputValue}
            placeholder="dd/mm/yyyy"
            onChange={handleInputChange}
          />
          <Calendar
            month={month}
            onMonthChange={setMonth}
            mode="single"
            selected={value}
            onSelect={handleDayPickerSelect}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;

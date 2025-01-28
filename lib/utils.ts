import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  eachWeekOfInterval,
  format,
  subDays,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
} from 'date-fns';
import { parse, isValid } from 'date-fns';

export const honoClient = hc<AppType>(process.env.NEXT_PUBLIC_APP_URl!);

const LAST_30_DAYS = 30;
const MILI_UNIT = 1000;
const CURRENCY = 'INR';
const PERCENT_100 = 100;
const PERCENT_0 = 0;
const LOCALE = 'en-IN';

export const convertAmountToMiliUnit = (amount: number) => {
  return Math.round(amount * MILI_UNIT);
};

export const convertAmountFromMiliUnit = (amount: number) => {
  return amount / MILI_UNIT;
};

export const formatCurrency = (value: number) => {
  return Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
};

export const calculatePercentageChange = (currentValue: number, previousValue: number) => {
  if (previousValue === PERCENT_0) {
    return previousValue === currentValue ? PERCENT_0 : PERCENT_100;
  }

  return ((currentValue - previousValue) / previousValue) * PERCENT_100;
};

export const fillMissingDays = (
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date
) => {
  if (activeDays.length === PERCENT_0) {
    return [];
  }

  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const transactionByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    return found || { date: day, income: 0, expenses: 0 };
  });

  return transactionByDay;
};

export const fillMissingMonths = (
  activeMonths: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date
) => {
  if (activeMonths.length === 0) {
    return [];
  }

  const allMonths = eachMonthOfInterval({ start: startDate, end: endDate });

  return allMonths.map((month) => {
    const found = activeMonths.find((d) => isSameMonth(d.date, month));
    return found || { date: month, income: 0, expenses: 0 };
  });
};

export const fillMissingYears = (
  activeYears: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date
) => {
  if (activeYears.length === 0) {
    return [];
  }

  const allYears = eachYearOfInterval({ start: startDate, end: endDate });

  return allYears.map((year) => {
    const found = activeYears.find((d) => isSameYear(d.date, year));
    return found || { date: year, income: 0, expenses: 0 };
  });
};

export const fillMissingWeek = (
  activeWeeks: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date
) => {
  if (activeWeeks.length === 0) {
    return [];
  }

  const allWeeks = eachWeekOfInterval({ start: startDate, end: endDate });

  return allWeeks.map((week) => {
    const found = activeWeeks.find((d) => isSameWeek(d.date, week));
    return found || { date: week, income: 0, expenses: 0 };
  });
};

type Period = {
  from: Date | string | undefined;
  to: Date | string | undefined;
};
export const formatDateRange = (period?: Period) => {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, LAST_30_DAYS);

  if (!period?.from) {
    return `${format(defaultFrom, 'LLL dd')} - ${format(defaultTo, 'LLL dd')}`;
  }

  if (!period?.to) {
    return `${format(period.from, 'LLL dd')} - ${format(defaultTo, 'LLL dd')}`;
  }
  return `${format(period.from, 'LLL dd')} - ${format(period.to, 'LLL dd')}`;
};

export const formatPercentage = (
  value: number,
  options: { addPrefix?: boolean } = { addPrefix: false }
) => {
  const result = Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / PERCENT_100);

  if (options.addPrefix) {
    return `+${result}%`;
  }

  return result;
};

export const parseDateWithFormats = (dateString: string, formats: string[]): Date | null => {
  for (const format of formats) {
    const parsedDate = parse(dateString.trim(), format, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  return null; // Return null if no format matches
};

export const downLoadJSON = (data: any, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export const isValidDate = (date: string | null) => date && !isNaN(new Date(date).getTime());

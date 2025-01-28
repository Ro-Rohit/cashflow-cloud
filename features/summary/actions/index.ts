'use client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { convertAmountFromMiliUnit, honoClient } from '@/lib/utils';
import { useFinancialReportStore } from '../hooks/use-financial-report-store';

type DateTruncType = 'day' | 'week' | 'month' | 'year';

const useQueryParams = () => {
  const params = useSearchParams();
  return {
    from: params.get('from') || '',
    to: params.get('to') || '',
    accountId: params.get('accountId') || '',
  };
};

const createQueryString = (params: Record<string, string | undefined>) => {
  return Object.entries(params)
    .filter(([_, value]) => value) // Exclude undefined, null, or empty strings
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join('&');
};

export const useGetSummary = () => {
  const { setFinancialReport } = useFinancialReportStore();
  const { from, to, accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['summary', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary.$get({ query: { from, to, accountId } });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch summary');
      }
      const data = await res.json();
      const formattedData = {
        ...data,
        incomeAmount: convertAmountFromMiliUnit(data.incomeAmount),
        expensesAmount: convertAmountFromMiliUnit(data.expensesAmount),
        remainingAmount: convertAmountFromMiliUnit(data.remainingAmount),
      };

      setFinancialReport({
        summaryData: formattedData,
        period: { from: new Date(from), to: new Date(to) },
      });

      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

  return query;
};

export const useGetTopIncomeTranactions = (filters: { from: string; to: string }) => {
  const { setFinancialReport } = useFinancialReportStore();
  const { from, to } = filters;
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['top-income-transactons', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['top-income-transaction'].$get({
        query: { from, to, accountId },
      });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch top Income transactions');
      }
      const data = await res.json();
      const formattedData = {
        topIncomes: data.topIncomes.map((item) => ({
          date: item.date as string,
          amount: convertAmountFromMiliUnit(item.amount),
          payee: item.payee as string,
        })),
      };

      if (formattedData.topIncomes.length !== 0) {
        setFinancialReport({ topIncomesData: formattedData.topIncomes });
      }

      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
    enabled: !!(from && to),
  });

  return query;
};

export const useGetTopExpenseTranactions = (filters: { from: string; to: string }) => {
  const { setFinancialReport } = useFinancialReportStore();

  const { from, to } = filters;
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['top-expenses-transactons', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['top-expenses-transaction'].$get({
        query: { from, to, accountId },
      });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch top Expense transactions ');
      }
      const data = await res.json();
      const formattedData = {
        topExpenses: data.topExpenses.map((transaction: any) => ({
          date: transaction.date as string,
          amount: convertAmountFromMiliUnit(transaction.amount),
          payee: transaction.payee as string,
        })),
      };
      if (formattedData.topExpenses.length !== 0) {
        setFinancialReport({ topExpensesData: formattedData.topExpenses });
      }
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
    enabled: !!(from && to),
  });

  return query;
};

export const useGetTopIncomeCategories = (filters: { from: string; to: string }) => {
  const { setFinancialReport } = useFinancialReportStore();

  const { from, to } = filters;
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['top-categories-income', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['top-income-categories'].$get({
        query: { from, to, accountId },
      });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch top Income categories ');
      }
      const data = await res.json();
      const formattedData = {
        topIncomeCategories: data.topIncomeCategories.map((item) => ({
          name: item.name as string,
          value: convertAmountFromMiliUnit(item.value),
        })),
      };

      if (formattedData.topIncomeCategories.length !== 0) {
        setFinancialReport({ topIncomeCategoryData: formattedData.topIncomeCategories });
      }
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
    enabled: !!(from && to),
  });

  return query;
};

export const useGetTopExpenseCategories = (filters: { from: string; to: string }) => {
  const { setFinancialReport } = useFinancialReportStore();

  const { from, to } = filters;
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['top-categories-expenses', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['top-expenses-categories'].$get({
        query: { from, to, accountId },
      });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch top Expense categories ');
      }
      const data = await res.json();
      const formattedData = {
        topExpenseCategories: data.topExpenseCategories.map((item: any) => ({
          name: item.name as string,
          value: convertAmountFromMiliUnit(item.value),
        })),
      };
      if (formattedData.topExpenseCategories.length !== 0) {
        setFinancialReport({ topExpensesCategoryData: formattedData.topExpenseCategories });
      }
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
    enabled: !!(from && to),
  });

  return query;
};

export const useGetActivePeriods = (filters: { from: string; to: string }) => {
  const { setFinancialReport } = useFinancialReportStore();
  const { from, to } = filters;
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['active-periods', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['active-days'].$get({
        query: { from, to, accountId },
      });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch active periods');
      }
      const data = await res.json();
      const formattedData = {
        ...data,
        activePeriods: data.activePeriods.map((itemByPeriod: any) => ({
          dateTrunc: itemByPeriod.dateTrunc as DateTruncType,
          activePeriodData: itemByPeriod.activePeriodData.map((item: any) => ({
            date: item.date as string,
            income: convertAmountFromMiliUnit(item.income),
            expenses: convertAmountFromMiliUnit(item.expenses),
          })),
        })),
      };
      if (formattedData.activePeriods.length !== 0) {
        setFinancialReport({ activePeriods: formattedData.activePeriods });
      }
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
    enabled: !!(from && to),
  });

  return query;
};

export const useGetCategoriesBudget = (filters: { from: string; to: string }) => {
  const { setFinancialReport } = useFinancialReportStore();
  const { from, to } = filters;
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['categories-budget', createQueryString({ from, to, accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['categories-budget'].$get({
        query: { from, to, accountId },
      });
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch Categories Budget summary');
      }
      const data = await res.json();
      const formattedData = {
        categoriesBudget: data.categoriesBudgetData.map((item) => ({
          name: item.name as string,
          budget: convertAmountFromMiliUnit(item.budget),
          income: convertAmountFromMiliUnit(item.income),
          expense: convertAmountFromMiliUnit(item.expense),
        })),
      };
      setFinancialReport({ CategoriesBudgetData: formattedData.categoriesBudget });
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
    enabled: !!(from && to),
  });

  return query;
};

export const useGetBillsSummary = () => {
  const { setFinancialReport } = useFinancialReportStore();
  const { accountId } = useQueryParams();

  const query = useQuery({
    queryKey: ['bill-summary', createQueryString({ accountId })],
    queryFn: async () => {
      const res = await honoClient.api.summary['bills'].$get();
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch bills summary');
      }
      const data = await res.json();
      if (data) {
        setFinancialReport({ billsData: data.billsData });
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount
  });

  return query;
};

export const useGetDataCount = () => {
  const query = useQuery({
    queryKey: ['data-count'],
    queryFn: async () => {
      const res = await honoClient.api.summary['get-data-count'].$get();
      if (!res || res.status !== 200) {
        throw new Error('Failed to fetch Data Count');
      }
      const { data } = await res.json();
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};

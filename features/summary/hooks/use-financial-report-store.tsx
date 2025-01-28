import { LAST_30_DAYS } from '@/lib/const';
import { subDays } from 'date-fns';
import { create } from 'zustand';

type SummaryDataType =
  | Record<
      | 'incomeAmount'
      | 'expensesAmount'
      | 'remainingAmount'
      | 'incomeChange'
      | 'expensesChange'
      | 'remainingChange',
      number
    >
  | undefined;
type TopTransactionType = Record<'date' | 'amount' | 'payee', any>;
type TopCategoryType = Record<'name' | 'value', any>;
type CategoriesBudgetType = Record<'name' | 'budget' | 'income' | 'expense', any>;
type DateTruncType = 'day' | 'week' | 'month' | 'year';
type ActivePeriodsType = {
  dateTrunc: DateTruncType;
  activePeriodData: Record<'date' | 'income' | 'expenses', any>[] | any[];
};
type BillDataType = Record<'name' | 'amount' | 'status' | 'dueDate' | 'year' | 'month', any>;

type financialReportType = {
  summaryData?: SummaryDataType;
  topIncomesData?: TopTransactionType[];
  topExpensesData?: TopTransactionType[];
  topIncomeCategoryData?: TopCategoryType[];
  topExpensesCategoryData?: TopCategoryType[];
  CategoriesBudgetData?: CategoriesBudgetType[];
  activePeriods?: ActivePeriodsType[];
  billsData?: BillDataType[];
  period: { from: Date; to: Date };
};

type Store = {
  financialReport: financialReportType;
  setFinancialReport: (data: Partial<financialReportType>) => void;
};

export const useFinancialReportStore = create<Store>()((set) => ({
  financialReport: {
    period: {
      from: subDays(new Date(), LAST_30_DAYS),
      to: new Date(),
    },
  },
  setFinancialReport: (data) =>
    set((state) => ({
      financialReport: {
        ...state.financialReport,
        ...data,
      },
    })),
}));

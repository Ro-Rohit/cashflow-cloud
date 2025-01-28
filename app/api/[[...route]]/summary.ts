import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { db } from '@/db';
import { transactionsTable, accountsTable, categoriesTable, billsTable } from '@/db/schema';
import { and, desc, eq, gte, lte, lt, sql, sum, gt, SQL } from 'drizzle-orm';
import { differenceInDays, parse, subDays } from 'date-fns';
import {
  calculatePercentageChange,
  convertAmountFromMiliUnit,
  fillMissingDays,
  fillMissingMonths,
  fillMissingWeek,
  fillMissingYears,
} from '@/lib/utils';
import { z } from 'zod';
import { LAST_30_DAYS } from '@/lib/const';

const TOP_LIMIT = 10;
const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');

      const { startDate, endDate } = getFilteringDates(from, to);
      const periodLength = differenceInDays(endDate, startDate) + 1;

      const lastPeriodStart = subDays(startDate, periodLength);
      const lastPeriodEnd = subDays(endDate, periodLength);

      const [currentPeriod] = await fetchFinancialData(user.userId, startDate, endDate, accountId);
      const [lastPeriod] = await fetchFinancialData(
        user.userId,
        lastPeriodStart,
        lastPeriodEnd,
        accountId
      );

      const incomeChange = calculatePercentageChange(currentPeriod.income, lastPeriod.income);
      const expensesChange = calculatePercentageChange(currentPeriod.expenses, lastPeriod.expenses);
      const remainingChange = calculatePercentageChange(
        currentPeriod.remaining,
        lastPeriod.remaining
      );

      return c.json(
        {
          remainingAmount: currentPeriod.remaining,
          remainingChange,
          incomeAmount: currentPeriod.income,
          incomeChange,
          expensesAmount: currentPeriod.expenses,
          expensesChange,
        },
        200
      );
    }
  )
  .get(
    '/active-days',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');
      const { startDate, endDate } = getFilteringDates(from, to);

      const chartZoomLevel = getChartZoomLevel(startDate, endDate);

      const results = await Promise.allSettled(
        chartZoomLevel.map((dateTrunc) =>
          fetchActivePeriods(user.userId, startDate, endDate, dateTrunc, accountId)
        )
      );

      const parsedResults = results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      });

      const activePeriods = parsedResults.filter((data) => data !== null);
      return c.json({ activePeriods, chartZoomLevel }, 200);
    }
  )
  .get('/get-data-count', async (c) => {
    const auth = getAuth(c);
    if (!auth || !auth.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [accountData, categoriesData, transactionData, billsData] = await Promise.all([
      db
        .select({
          accountCount: sql`COUNT(${accountsTable.id})`.mapWith(Number),
        })
        .from(accountsTable)
        .where(eq(accountsTable.userId, auth.userId)),

      db
        .select({
          categoriesCount: sql`COUNT(${categoriesTable.id})`.mapWith(Number),
        })
        .from(categoriesTable)
        .where(eq(categoriesTable.userId, auth.userId)),

      db
        .select({
          transactionCount: sql`COUNT(${transactionsTable.id})`.mapWith(Number),
        })
        .from(transactionsTable)
        .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
        .where(eq(accountsTable.userId, auth.userId)),

      db
        .select({
          billsCount: sql`COUNT(${billsTable.id})`.mapWith(Number),
        })
        .from(billsTable)
        .where(eq(billsTable.userId, auth.userId)),
    ]);

    const data = {
      accountCount: accountData[0]?.accountCount || 0,
      categoriesCount: categoriesData[0]?.categoriesCount || 0,
      transactionCount: transactionData[0]?.transactionCount || 0,
      billsCount: billsData[0]?.billsCount || 0,
    };

    if (!data) {
      return c.json({ error: 'No data found' }, 404);
    }

    return c.json({ data }, 200);
  })
  .get(
    '/top-income-transaction',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');
      const { startDate, endDate } = getFilteringDates(from, to);

      const topIncomes = await fetchTopTransactions(
        user.userId,
        startDate,
        endDate,
        'topIncomes',
        accountId
      );

      return c.json({ topIncomes }, 200);
    }
  )
  .get(
    '/top-expenses-transaction',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');
      const { startDate, endDate } = getFilteringDates(from, to);

      const topExpenses = await fetchTopTransactions(
        user.userId,
        startDate,
        endDate,
        'topExpenses',
        accountId
      );

      return c.json({ topExpenses }, 200);
    }
  )
  .get(
    '/top-income-categories',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');
      const { startDate, endDate } = getFilteringDates(from, to);
      const topIncomeCategories = await fetchTopCategories(
        user.userId,
        startDate,
        endDate,
        'TopIncome',
        TOP_LIMIT,
        accountId
      );

      return c.json({ topIncomeCategories }, 200);
    }
  )
  .get(
    '/top-expenses-categories',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');
      const { startDate, endDate } = getFilteringDates(from, to);
      const topExpenseCategories = await fetchTopCategories(
        user.userId,
        startDate,
        endDate,
        'TopExpense',
        TOP_LIMIT,
        accountId
      );
      return c.json({ topExpenseCategories }, 200);
    }
  )
  .get(
    '/categories-budget',
    zValidator(
      'query',
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user || !user.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      try {
        const { from, to, accountId } = c.req.valid('query');
        const { startDate, endDate } = getFilteringDates(from, to);
        const categoriesBudgetData = await fetchCategoriesBudget(
          user.userId,
          startDate,
          endDate,
          accountId
        );

        return c.json({ categoriesBudgetData }, 200);
      } catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .get('/bills', async (c) => {
    const user = getAuth(c);
    if (!user || !user.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const billsData = await db
      .select({
        year: sql`EXTRACT(YEAR FROM ${billsTable.dueDate})`.mapWith(Number),
        month: sql`EXTRACT(MONTH FROM ${billsTable.dueDate})`.mapWith(Number),
        status: billsTable.status,
        dueDate: billsTable.dueDate,
        name: billsTable.name,
        amount: sql`SUM(${billsTable.amount})`.mapWith(Number),
      })
      .from(billsTable)
      .where(eq(billsTable.userId, user.userId))
      .groupBy(
        sql`EXTRACT(YEAR FROM ${billsTable.dueDate}), EXTRACT(MONTH FROM ${billsTable.dueDate}), ${billsTable.name}, ${billsTable.status}, ${billsTable.dueDate}`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${billsTable.dueDate}), EXTRACT(MONTH FROM ${billsTable.dueDate})`
      );

    const { formattedBills, uniqueYears } = generateFormattedBills(billsData);

    return c.json({ billsData: formattedBills, uniqueYears }, 200);
  });

export default app;

const fetchFinancialData = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  accountId?: string
) => {
  return await db
    .select({
      income:
        sql`SUM(CASE WHEN ${transactionsTable.amount} > 0 THEN ${transactionsTable.amount} ELSE 0 END)`.mapWith(
          Number
        ),
      expenses:
        sql`SUM(CASE WHEN ${transactionsTable.amount} < 0 THEN ${transactionsTable.amount} ELSE 0 END)`.mapWith(
          Number
        ),
      remaining: sum(transactionsTable.amount).mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        eq(accountsTable.userId, userId),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate)
      )
    );
};

const fetchTopCategories = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  type: 'TopIncome' | 'TopExpense' = 'TopIncome',
  limit: number,
  accountId?: string
) => {
  return await db
    .select({
      name: categoriesTable.name,
      value: sql`SUM(ABS(${transactionsTable.amount}))`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
    .innerJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        eq(accountsTable.userId, userId),
        type === 'TopIncome' ? gt(transactionsTable.amount, 0) : lt(transactionsTable.amount, 0),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate)
      )
    )
    .groupBy(categoriesTable.name)
    .orderBy(desc(sql`SUM(ABS(${transactionsTable.amount}))`))
    .limit(limit);
};

const fetchCategoriesBudget = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  accountId?: string
) => {
  const categoriesData = await db
    .select({
      name: categoriesTable.name,
      budget: categoriesTable.budget,
      value: sql`SUM(${transactionsTable.amount})`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
    .innerJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        eq(accountsTable.userId, userId),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate)
      )
    )
    .groupBy(categoriesTable.name, categoriesTable.budget)
    .orderBy(desc(sql`SUM(${transactionsTable.amount})`));

  if (categoriesData.length === 0) {
    return [];
  }

  return categoriesData.map((entry) => ({
    name: entry.name,
    income: entry.value > 0 ? entry.value : 0,
    expense: entry.value < 0 ? Math.abs(entry.value) : 0,
    budget: entry.budget,
  }));
};

const fetchActivePeriods = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  dateTrunc: 'day' | 'week' | 'month' | 'year',
  accountId?: string
) => {
  const arrangedBy =
    dateTrunc === 'week'
      ? sql`DATE_TRUNC('week', ${transactionsTable.date})`
      : dateTrunc === 'month'
      ? sql`DATE_TRUNC('month', ${transactionsTable.date})`
      : dateTrunc === 'year'
      ? sql`DATE_TRUNC('year', ${transactionsTable.date})`
      : transactionsTable.date; // Always group by date if no truncation.

  const activePeriods = await db
    .select({
      date: arrangedBy as SQL<Date>, // Use the grouped/truncated date.
      income:
        sql`SUM(CASE WHEN ${transactionsTable.amount} >= 0 THEN ${transactionsTable.amount} ELSE 0 END)`.mapWith(
          Number
        ),
      expenses:
        sql`SUM(CASE WHEN ${transactionsTable.amount} < 0 THEN ABS(${transactionsTable.amount}) ELSE 0 END)`.mapWith(
          Number
        ),
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        eq(accountsTable.userId, userId),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate)
      )
    )
    .groupBy(arrangedBy ?? transactionsTable.date)
    .orderBy(arrangedBy ?? transactionsTable.date);

  if (dateTrunc === 'day') {
    const data = fillMissingDays(activePeriods, startDate, endDate);
    return { dateTrunc: dateTrunc, activePeriodData: data };
  } else if (dateTrunc === 'week') {
    const data = fillMissingWeek(activePeriods, startDate, endDate);
    return { dateTrunc: dateTrunc, activePeriodData: data };
  } else if (dateTrunc === 'month') {
    const data = fillMissingMonths(activePeriods, startDate, endDate);
    return { dateTrunc: dateTrunc, activePeriodData: data };
  } else {
    const data = fillMissingYears(activePeriods, startDate, endDate);
    return { dateTrunc: dateTrunc, activePeriodData: data };
  }
};

const fetchTopTransactions = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  type: 'topIncomes' | 'topExpenses',
  accountId?: string
) => {
  const data = await db
    .select({
      date: transactionsTable.date,
      amount: sql`ABS(${transactionsTable.amount})`.mapWith(Number),
      payee: transactionsTable.payee,
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        eq(accountsTable.userId, userId),
        type === 'topIncomes' ? gt(transactionsTable.amount, 0) : lt(transactionsTable.amount, 0),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate)
      )
    )
    .orderBy(transactionsTable.amount)
    .limit(TOP_LIMIT);

  return data;
};

const getFilteringDates = (from?: string, to?: string) => {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, LAST_30_DAYS);

  const startDate = from ? parse(from, 'yyyy-MM-dd', new Date()) : defaultFrom;
  const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo;
  return { startDate, endDate };
};

const getChartZoomLevel = (
  startDate: Date,
  endDate: Date
): ('day' | 'week' | 'month' | 'year')[] => {
  const periodLength = differenceInDays(endDate, startDate) + 1;
  const TWO_MONTH = 60;
  const ONE_YEAR = 12 * 30;
  const TWO_YEAR = 90;

  if (periodLength <= TWO_MONTH) {
    return ['day', 'week'];
  }

  if (periodLength > TWO_MONTH || periodLength <= ONE_YEAR) {
    return ['week', 'month'];
  }

  if (periodLength > ONE_YEAR || periodLength <= TWO_YEAR) {
    return ['month', 'year'];
  }

  return ['year'];
};

const generateFormattedBills = (
  data: {
    year: number;
    month: number;
    name: string;
    amount: number;
    dueDate: Date;
    status: 'paid' | 'pending' | 'overdue';
  }[]
) => {
  // Extract all unique years and bill names from the data
  const uniqueYears = [...new Set(data.map((item) => item.year))];

  const formattedBills = data.map((item) => ({
    ...item,
    amount: convertAmountFromMiliUnit(item.amount),
    month: getMonthName(item.month),
  }));
  return { formattedBills, uniqueYears };
};

function getMonthName(monthNumber: number): string {
  // JavaScript months are 0-based (0 = January, 11 = December)
  const date = new Date(2025, monthNumber - 1);
  return date.toLocaleString('default', { month: 'short' }); // 'short' for "Jan", "Feb"
}

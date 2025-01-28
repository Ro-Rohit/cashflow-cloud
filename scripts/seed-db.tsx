import { seed } from 'drizzle-seed';
import { db } from '@/db';
import { accountsTable, transactionsTable, categoriesTable } from '../db/schema';
import { eachDayOfInterval, format, sub, subDays } from 'date-fns';
import { convertAmountToMiliUnit } from '@/lib/utils';

const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 30);

const SEED_TRANSACTIONS: (typeof transactionsTable.$inferInsert)[] = [];

const SEED_USER_ID = 'user_1';
const SEED_ACCOUNTS: (typeof accountsTable.$inferInsert)[] = [
  { id: 'account_1', name: 'Checking', userId: SEED_USER_ID, plaidId: null },
  { id: 'account_2', name: 'Savings', userId: SEED_USER_ID, plaidId: null },
];
const SEED_CATEGORIES: (typeof categoriesTable.$inferInsert)[] = [
  {
    id: 'category_1',
    name: 'Rent',
    userId: SEED_USER_ID,
    plaidId: null,
  },
  {
    id: 'category_2',
    name: 'Groceries',
    userId: SEED_USER_ID,
    plaidId: null,
  },
  {
    id: 'category_3',
    name: 'Food',
    userId: SEED_USER_ID,
    plaidId: null,
  },
  {
    id: 'category_4',
    name: 'Entertainment',
    userId: SEED_USER_ID,
    plaidId: null,
  },
  {
    id: 'category_5',
    name: 'Miscellanous',
    userId: SEED_USER_ID,
    plaidId: null,
  },
];

const generateRandomAmount = (category: typeof categoriesTable.$inferInsert) => {
  switch (category.name) {
    case 'Rent':
      return Math.random() * 400 + 90;
    case 'Groceries':
      return Math.random() * 200 + 50;
    case 'Food':
      return Math.random() * 300 + 50;
    case 'Entertainment':
      return Math.random() * 500 + 50;
    case 'Miscellanous':
      return Math.random() * 100 + 50;
    default:
      return Math.random() * 50 + 50;
  }
};

const generateTransactionForDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 4) + 1; //1 to 4 transaction per day;

  for (let i = 0; i < numTransactions; i++) {
    const category = SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];

    const isExpense = Math.random() > 0.6;
    const amount = generateRandomAmount(category);
    const formattedAmount = convertAmountToMiliUnit(isExpense ? -amount : amount);

    SEED_TRANSACTIONS.push({
      id: `transaction_${format(day, 'yyyy-MM-dd')}_${i}`,
      accountId: SEED_ACCOUNTS[0].id ?? 'account_1',
      categoryId: category.id,
      amount: formattedAmount,
      date: day,
      payee: 'Merchant',
      notes: 'Random transaction',
    });
  }
};

const generateTransaction = () => {
  const days = eachDayOfInterval({ start: defaultFrom, end: defaultTo });
};

generateTransaction();

async function main() {
  try {
    await db.delete(accountsTable).execute();
    await db.delete(transactionsTable).execute();
    await db.delete(categoriesTable).execute();
    await db.insert(categoriesTable).values(SEED_CATEGORIES).execute();
    await db.insert(accountsTable).values(SEED_ACCOUNTS).execute();
    await db.insert(transactionsTable).values(SEED_TRANSACTIONS).execute();
  } catch (error) {
    process.exit(1);
  }
}

main();

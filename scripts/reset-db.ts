import { accountsTable, categoriesTable, transactionsTable } from '@/db/schema';
import { db } from '@/db';
import { reset } from 'drizzle-seed';

async function main() {
  try {
    await reset(db, { accountsTable, categoriesTable, transactionsTable });
  } catch (error) {
    throw new Error(`error resetting database: ${error}`);
  }
}

main();

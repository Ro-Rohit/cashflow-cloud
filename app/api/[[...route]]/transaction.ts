import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { db } from '@/db';
import {
  transactionsTable,
  insertTransactionsSchema,
  accountsTable,
  categoriesTable,
} from '@/db/schema';
import { and, desc, eq, gt, inArray, lt, sql } from 'drizzle-orm';
import { v4 } from 'uuid';
import { z } from 'zod';
import { parse, subDays } from 'date-fns';
import { LAST_30_DAYS } from '@/lib/const';

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
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { from, to, accountId } = c.req.valid('query');

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, LAST_30_DAYS);

      const startDate = from ? parse(from, 'yyyy-MM-dd', new Date()) : defaultFrom;
      const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo;

      const data = await db
        .select({
          id: transactionsTable.id,
          notes: transactionsTable.notes,
          amount: transactionsTable.amount,
          date: transactionsTable.date,
          payee: transactionsTable.payee,
          categoryId: transactionsTable.categoryId,
          accountId: transactionsTable.accountId,
          accountName: accountsTable.name,
          categoryName: categoriesTable.name,
        })
        .from(transactionsTable)
        .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
        .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
        .where(
          and(
            accountId ? eq(transactionsTable.accountId, accountId) : undefined,
            eq(accountsTable.userId, user.userId),
            gt(transactionsTable.date, startDate),
            lt(transactionsTable.date, endDate),
            eq(transactionsTable.archieve, false)
          )
        )
        .orderBy(desc(transactionsTable.date));

      if (!data) {
        return c.json({ error: 'No transactions found' }, 404);
      }

      return c.json({ data: data }, 200);
    }
  )
  .get(
    '/:id',

    zValidator('param', insertTransactionsSchema.pick({ id: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('param');
      if (!values.id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const [data] = await db
        .select({
          id: transactionsTable.id,
          notes: transactionsTable.notes,
          amount: transactionsTable.amount,
          date: transactionsTable.date,
          payee: transactionsTable.payee,
          categoryId: transactionsTable.categoryId,
          accountId: transactionsTable.accountId,
        })
        .from(transactionsTable)
        .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
        .where(and(eq(accountsTable.userId, user.userId), eq(transactionsTable.archieve, false)));

      if (!data) {
        return c.json({ error: 'No transaction found' }, 404);
      }

      return c.json({ data: data }, 200);
    }
  )
  .post(
    '/',
    zValidator(
      'json',
      insertTransactionsSchema.pick({
        creationType: true,
        payee: true,
        amount: true,
        date: true,
        notes: true,
        categoryId: true,
        accountId: true,
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('json');
      if (!values) {
        return c.json({ error: 'Invalid values' }, 400);
      }
      const [data] = await db
        .insert(transactionsTable)
        .values({
          id: v4(),
          date: values.date,
          payee: values.payee,
          amount: values.amount,
          categoryId: values.categoryId,
          accountId: values.accountId,
          notes: values.notes,
        })
        .returning();

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertTransactionsSchema.omit({ id: true, archieve: true }))),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('json');
      if (!values) {
        return c.json({ error: 'Invalid values' }, 400);
      }

      const data = await db
        .insert(transactionsTable)
        .values([...values])
        .returning({ id: transactionsTable.id });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .patch(
    '/:id',

    zValidator(
      'json',
      insertTransactionsSchema.pick({
        payee: true,
        amount: true,
        date: true,
        notes: true,
        categoryId: true,
        accountId: true,
      })
    ),
    zValidator('param', insertTransactionsSchema.pick({ id: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { id } = c.req.valid('param');
      if (!id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const values = c.req.valid('json');
      if (!values) {
        return c.json({ error: 'Invalid values' }, 400);
      }

      const transactionsToUpdate = db.$with('transaction_to_update').as(
        db
          .select({ id: transactionsTable.id })
          .from(transactionsTable)
          .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
          .where(and(eq(transactionsTable.id, id), eq(accountsTable.userId, user.userId)))
      );

      const [updatedTransactionData] = await db
        .with(transactionsToUpdate)
        .update(transactionsTable)
        .set({ ...values })
        .where(eq(transactionsTable.id, id))
        .returning({ id: transactionsTable.id });

      if (!updatedTransactionData) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data: updatedTransactionData }, 200);
    }
  )
  .delete(
    '/:id',

    zValidator('param', insertTransactionsSchema.pick({ id: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('param');
      if (!values.id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const transactionsToDelete = db.$with('transaction_to_delete').as(
        db
          .select({ id: transactionsTable.id })
          .from(transactionsTable)
          .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
          .where(and(eq(transactionsTable.id, values.id), eq(accountsTable.userId, user.userId)))
      );

      const [deletedTransactionData] = await db
        .with(transactionsToDelete)
        .delete(transactionsTable)
        .where(eq(transactionsTable.id, values.id))
        .returning({ id: transactionsTable.id });

      if (!deletedTransactionData) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data: deletedTransactionData }, 201);
    }
  )
  .post(
    '/bulk-delete',
    zValidator('json', z.object({ ids: z.array(z.string()) })),

    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { ids } = c.req.valid('json');
      if (!ids) {
        return c.json({ error: 'Invalid ids' }, 400);
      }

      const transactionsToDelete = db.$with('transaction_to_deletes').as(
        db
          .select({ id: transactionsTable.id })
          .from(transactionsTable)
          .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
          .where(and(inArray(transactionsTable.id, ids), eq(accountsTable.userId, user.userId)))
      );

      const [deletedTransactionData] = await db
        .with(transactionsToDelete)
        .delete(transactionsTable)
        .where(inArray(transactionsTable.id, sql`(select id from ${transactionsToDelete})`))
        .returning({ id: transactionsTable.id });

      if (!deletedTransactionData) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data: deletedTransactionData }, 201);
    }
  );

export default app;

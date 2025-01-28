import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { db } from '@/db';
import { billsTable, insertBillSchema } from '@/db/schema';
import { and, eq, gt, inArray, lt } from 'drizzle-orm';
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

      const { from, to } = c.req.valid('query');

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, LAST_30_DAYS);

      const startDate = from ? parse(from, 'yyyy-MM-dd', new Date()) : defaultFrom;
      const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo;

      const billsData = await db
        .select({
          id: billsTable.id,
          name: billsTable.name,
          amount: billsTable.amount,
          status: billsTable.status,
          type: billsTable.type,
          remind: billsTable.remind,
          dueDate: billsTable.dueDate,
        })
        .from(billsTable)
        .where(
          and(
            eq(billsTable.userId, user.userId),
            gt(billsTable.dueDate, startDate),
            lt(billsTable.dueDate, endDate)
          )
        );

      if (!billsData) {
        return c.json({ error: 'No Bills found' }, 404);
      }

      return c.json({ data: billsData }, 200);
    }
  )
  .get(
    '/:id',

    zValidator('param', insertBillSchema.pick({ id: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('param');
      if (!values.id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const [billsData] = await db
        .select({
          id: billsTable.id,
          name: billsTable.name,
          amount: billsTable.amount,
          status: billsTable.status,
          type: billsTable.type,
          remind: billsTable.remind,
          dueDate: billsTable.dueDate,
        })
        .from(billsTable)
        .where(and(eq(billsTable.id, values.id), eq(billsTable.userId, user.userId)));

      if (!billsData) {
        return c.json({ error: 'No bill found' }, 404);
      }

      return c.json({ data: billsData }, 200);
    }
  )
  .post(
    '/',

    zValidator('json', insertBillSchema.omit({ id: true, userId: true, createdAt: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('json');
      if (!values) {
        return c.json({ error: 'Bad request' }, 400);
      }

      const [data] = await db
        .insert(billsTable)
        .values({ ...values, userId: user.userId })
        .returning();

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .patch(
    '/:id',

    zValidator('json', insertBillSchema.omit({ id: true, userId: true, createdAt: true })),
    zValidator('param', insertBillSchema.pick({ id: true })),
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
        return c.json({ error: 'Bad request' }, 400);
      }

      const [updatedBillsData] = await db
        .update(billsTable)
        .set({ ...values })
        .where(and(eq(billsTable.id, id), eq(billsTable.userId, user.userId)))
        .returning();

      if (!updatedBillsData) {
        return c.json({ error: 'internal server error' }, 500);
      }
      return c.json({ data: updatedBillsData }, 200);
    }
  )
  .delete(
    '/:id',

    zValidator('param', insertBillSchema.pick({ id: true })),
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
        .delete(billsTable)
        .where(and(eq(billsTable.id, values.id), eq(billsTable.userId, user.userId)))
        .returning({ id: billsTable.id });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertBillSchema.omit({ id: true, createdAt: true }))),
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
        .insert(billsTable)
        .values([...values])
        .returning({ id: billsTable.id });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
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

      const [data] = await db
        .delete(billsTable)
        .where(and(eq(billsTable.userId, user.userId), inArray(billsTable.id, ids)))
        .returning({ id: billsTable.id });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  );

export default app;

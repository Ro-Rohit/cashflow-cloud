import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { db } from '@/db';
import { accountsTable, insertAccountsSchema } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { v4 } from 'uuid';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const user = getAuth(c);
    if (!user?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accountsData = await db
      .select({ id: accountsTable.id, name: accountsTable.name })
      .from(accountsTable)
      .where(and(eq(accountsTable.userId, user.userId), eq(accountsTable.archieve, false)));

    if (!accountsData) {
      return c.json({ error: 'No accounts found' }, 404);
    }

    return c.json({ data: accountsData }, 200);
  })
  .get(
    '/:id',

    zValidator('param', insertAccountsSchema.pick({ id: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('param');
      if (!values.id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const [accountData] = await db
        .select({ id: accountsTable.id, name: accountsTable.name })
        .from(accountsTable)
        .where(
          and(
            eq(accountsTable.id, values.id),
            eq(accountsTable.userId, user.userId),
            eq(accountsTable.archieve, false)
          )
        );

      if (!accountData) {
        return c.json({ error: 'No account found' }, 404);
      }

      return c.json({ data: accountData }, 200);
    }
  )
  .post(
    '/',

    zValidator(
      'json',
      insertAccountsSchema.omit({
        id: true,
        userId: true,
        archieve: true,
      })
    ),
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
        .insert(accountsTable)
        .values({
          id: v4(),
          ...values,
          userId: user.userId,
          archieve: false,
        })
        .returning();

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .patch(
    '/:id',

    zValidator('json', insertAccountsSchema.omit({ id: true, userId: true })),
    zValidator('param', insertAccountsSchema.pick({ id: true })),
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
        return c.json({ error: 'Invalid name' }, 400);
      }

      const [updatedAccountData] = await db
        .update(accountsTable)
        .set({ ...values })
        .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, user.userId)))
        .returning();

      if (!updatedAccountData) {
        return c.json({ error: 'internal server error' }, 500);
      }
      return c.json({ data: updatedAccountData }, 200);
    }
  )
  .delete(
    '/:id',

    zValidator('param', insertAccountsSchema.pick({ id: true })),
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
        .delete(accountsTable)
        .where(and(eq(accountsTable.id, values.id), eq(accountsTable.userId, user.userId)))
        .returning({ id: accountsTable.id });

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
        .delete(accountsTable)
        .where(and(eq(accountsTable.userId, user.userId), inArray(accountsTable.id, ids)))
        .returning({ id: accountsTable.id });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  );

export default app;

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { db } from '@/db';
import { categoriesTable, insertCategoriesSchema } from '@/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { v4 } from 'uuid';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const user = getAuth(c);
    if (!user?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const categoriesData = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        budget: categoriesTable.budget,
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, user.userId));

    if (!categoriesData) {
      return c.json({ error: 'No categories found' }, 404);
    }

    return c.json({ data: categoriesData }, 200);
  })
  .get(
    '/:id',

    zValidator('param', insertCategoriesSchema.pick({ id: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('param');
      if (!values.id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const [categoryData] = await db
        .select({
          id: categoriesTable.id,
          name: categoriesTable.name,
          budget: categoriesTable.budget,
        })
        .from(categoriesTable)
        .where(and(eq(categoriesTable.id, values.id), eq(categoriesTable.userId, user.userId)));

      if (!categoryData) {
        return c.json({ error: 'No category found' }, 404);
      }

      return c.json({ data: categoryData }, 200);
    }
  )
  .post(
    '/',

    zValidator('json', insertCategoriesSchema.pick({ name: true, budget: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('json');
      const [data] = await db
        .insert(categoriesTable)
        .values({
          id: v4(),
          name: values.name,
          userId: user.userId,
          budget: values.budget,
        })
        .returning()
        .onConflictDoUpdate({
          target: categoriesTable.name,
          set: {
            name: values.name,
            budget: values.budget,
          },
        });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(insertCategoriesSchema.pick({ name: true, budget: true, userId: true }))
    ),
    async (c) => {
      try {
        const user = getAuth(c);
        if (!user?.userId) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        const values = c.req.valid('json');
        if (!values) {
          return c.json({ error: 'Invalid values' }, 400);
        }

        // Step 1: Filter unique categories but track original indices
        const uniqueCategories: (typeof insertCategoriesSchema._type)[] = [];
        const indexMap = new Map(); // Maps name to original indices
        values.forEach((item, index) => {
          if (!indexMap.has(item.name)) {
            indexMap.set(item.name, []);
            uniqueCategories.push(item);
          }
          indexMap.get(item.name).push(index);
        });

        // Step 2: Insert unique categories into the database
        const insertedData = await db
          .insert(categoriesTable)
          .values(uniqueCategories)
          .returning({ id: categoriesTable.id, name: categoriesTable.name })
          .onConflictDoUpdate({
            target: categoriesTable.name,
            set: {
              budget: sql.raw(`EXCLUDED.budget`), // Use the budget from the current insert
            },
          });

        if (!insertedData) {
          return c.json({ error: 'Internal server error' }, 500);
        }

        // Step 3: Map IDs back to the original input order
        const idMap = new Map(insertedData.map((item) => [item.name, item.id]));
        const result = values.map((item) => ({
          ...item,
          id: idMap.get(item.name), // Retrieve ID for the corresponding name
        }));

        return c.json({ data: result }, 201);
      } catch (error) {
        return c.json({ error: 'Internal server error' }, 500);
      }
    }
  )
  .patch(
    '/:id',

    zValidator('json', insertCategoriesSchema.omit({ id: true, userId: true })),
    zValidator('param', insertCategoriesSchema.pick({ id: true })),
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
      if (!values.name) {
        return c.json({ error: 'Invalid name' }, 400);
      }

      const [categoryData] = await db
        .select({ id: categoriesTable.id, name: categoriesTable.name })
        .from(categoriesTable)
        .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, user.userId)));

      if (!categoryData) {
        return c.json({ error: 'No category found' }, 404);
      }

      const [updatedCategoryData] = await db
        .update(categoriesTable)
        .set({ ...values })
        .where(
          and(eq(categoriesTable.id, categoryData.id), eq(categoriesTable.userId, user.userId))
        )
        .returning();

      if (!updatedCategoryData) {
        return c.json({ error: 'internal server error' }, 500);
      }
      return c.json({ data: updatedCategoryData }, 200);
    }
  )
  .delete(
    '/:id',

    zValidator('param', insertCategoriesSchema.pick({ id: true })),
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
        .delete(categoriesTable)
        .where(and(eq(categoriesTable.id, values.id), eq(categoriesTable.userId, user.userId)))
        .returning({ id: categoriesTable.id });

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
        .delete(categoriesTable)
        .where(and(eq(categoriesTable.userId, user.userId), inArray(categoriesTable.id, ids)))
        .returning({ id: categoriesTable.id });

      if (!data) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data }, 201);
    }
  );

export default app;

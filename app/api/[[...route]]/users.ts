import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { db } from '@/db';
import { and, eq, gt } from 'drizzle-orm';
import z from 'zod';
import {
  insertUsersSchema,
  insertVerificationTokenSchema,
  tokenTypeEnumSchema,
  usersTable,
  verificationTokenTable,
} from '@/db/schema';
import { clerkClient } from '@clerk/nextjs/server';
import { generateEmailTemplate, generateSecureToken, sendEmail } from '@/lib/resend-emails';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;

const app = new Hono()
  .get('/', async (c) => {
    const user = getAuth(c);
    if (!user?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [userData] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId));

    if (!userData) {
      return c.json({ error: 'No user found' }, 404);
    }

    return c.json({ data: userData }, 200);
  })
  .post('/', zValidator('json', insertUsersSchema.omit({ id: true })), async (c) => {
    const user = getAuth(c);
    if (!user?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const values = c.req.valid('json');

    if (!values) {
      return c.json({ error: 'Bad Request' }, 400);
    }

    const [data] = await db
      .insert(usersTable)
      .values({
        id: user.userId,
        ...values,
      })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          id: user.userId,
          ...values,
        },
      })
      .returning({ id: usersTable.id });

    if (!data) {
      return c.json({ error: 'internal server error' }, 500);
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(user.userId, {
      publicMetadata: {
        isUserData: true,
      },
    });

    return c.json({ data }, 201);
  })
  .patch(
    '/',

    zValidator('json', insertUsersSchema.omit({ id: true, email: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const values = c.req.valid('json');
      if (!values) {
        return c.json({ error: 'Bad Request' }, 400);
      }

      const [updatedUserData] = await db
        .update(usersTable)
        .set({ ...values })
        .where(eq(usersTable.id, user.userId))
        .returning({ id: usersTable.id });

      if (!updatedUserData) {
        return c.json({ error: 'internal server error' }, 500);
      }

      return c.json({ data: updatedUserData }, 200);
    }
  )
  .post('/delete-user', zValidator('json', insertUsersSchema.pick({ id: true })), async (c) => {
    const user = getAuth(c);
    if (!user?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const values = c.req.valid('json');

      if (!values.id) {
        return c.json({ error: 'Bad Request' }, 400);
      }

      const [data] = await db
        .delete(usersTable)
        .where(eq(usersTable.id, values.id))
        .returning({ id: usersTable.id });

      if (!data) {
        return c.json({ error: 'internal server error: user not deleted' }, 500);
      }

      const client = await clerkClient();
      await client.users.deleteUser(user.userId);

      return c.json({ data }, 200);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'internal server error' }, 500);
    }
  })
  .post(
    '/create-and-send-token',
    zValidator(
      'json',
      z.object({
        tokenType: tokenTypeEnumSchema,
        email: z.string().email(),
        username: z.string().optional(),
      })
    ),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (!COMPANY_EMAIL) {
        return c.json({ error: 'internal server error: company email not found' }, 500);
      }

      const { token, expiresAt } = generateSecureToken();
      const { tokenType, email, username } = c.req.valid('json');

      if (!tokenType || !email) {
        return c.json({ error: 'Bad Request' }, 400);
      }

      await db
        .delete(verificationTokenTable)
        .where(
          and(
            eq(verificationTokenTable.userId, user.userId),
            eq(verificationTokenTable.tokenType, tokenType),
            gt(verificationTokenTable.expiresAt, new Date())
          )
        );

      const [data] = await db
        .insert(verificationTokenTable)
        .values({
          token,
          createdAt: new Date(),
          tokenType: tokenType,
          email: email,
          expiresAt: expiresAt,
          userId: user.userId,
        })
        .returning({ id: usersTable.id, token: verificationTokenTable.token });

      if (!data) {
        return c.json({ error: 'internal server error: token not created' }, 500);
      }

      const emailSent = await sendEmail(
        email,
        'Verification Code',
        generateEmailTemplate(username || email, token)
      );

      if (emailSent.error) {
        return c.json({ error: 'internal server error: email not sent' }, 500);
      }

      return c.json({ data }, 201);
    }
  )
  .post(
    '/verify-token',
    zValidator('json', insertVerificationTokenSchema.pick({ token: true, tokenType: true })),
    async (c) => {
      const user = getAuth(c);
      if (!user?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { token, tokenType } = c.req.valid('json');

      if (!token || !tokenType) {
        return c.json({ error: 'Bad Request' }, 400);
      }

      const [verifiedtoken] = await db
        .select()
        .from(verificationTokenTable)
        .where(
          and(
            eq(verificationTokenTable.token, token),
            eq(verificationTokenTable.tokenType, tokenType),
            gt(verificationTokenTable.expiresAt, new Date()),
            eq(verificationTokenTable.userId, user.userId)
          )
        );

      if (!verifiedtoken) {
        return c.json({ data: 'no token found' }, 404);
      }

      return c.json({ data: 'token verfied successfully' }, 201);
    }
  );

export default app;

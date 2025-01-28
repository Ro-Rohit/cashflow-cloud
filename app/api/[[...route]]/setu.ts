import { getAuth } from '@hono/clerk-auth';
import { Hono } from 'hono';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createConsent, getToken } from '@/lib/setu-actions';

const app = new Hono().post('/consent', async (c) => {
  try {
    const auth = getAuth(c);
    if (!auth || !auth.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tokenResponse = await getToken();

    if (tokenResponse.status !== 200 || !tokenResponse.data?.access_token) {
      return c.json({ error: 'Failed to connect to provider' }, 500);
    }

    const token = tokenResponse.data.access_token;
    console.log(token);

    const [user] = await db
      .select({ username: usersTable.username, phone: usersTable.phone })
      .from(usersTable)
      .where(eq(usersTable.id, auth.userId))
      .limit(1);

    if (!user) {
      return c.json({ error: 'User not found.' }, 500);
    }

    const phoneNoWithoutCountryCode = user.phone.startsWith('+') ? user.phone.slice(3) : user.phone;

    const consentResponse = await createConsent(token, phoneNoWithoutCountryCode);

    if (consentResponse.status !== 201 || !consentResponse.data?.id || !consentResponse.data?.url) {
      return c.json({ error: 'Failed to create consent' }, 500);
    }
    console.log(consentResponse.data.url);

    return c.json({ url: consentResponse.data.url as string }, 201);
  } catch (error) {
    return c.json({ error: 'Something went wrong' }, 500);
  }
});

export default app;

import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import Accounts from './account';
import Categories from './categories';
import Transaction from './transaction';
import Summary from './summary';
import Subscription from './subscription';
import Users from './users';
import Setu from './setu';
import Webhook from './webhook';
import Bills from './bills';
import Remainder from './remainder';

import { HTTPException } from 'hono/http-exception';
import { clerkMiddleware } from '@hono/clerk-auth';

export const runtime = 'edge';

const app = new Hono().basePath('/api');
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

app.use('/webhook/*', (_, next) => {
  return next();
});

app.use('/remainder/*', (_, next) => {
  return next();
});

app.use('/users/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/accounts/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/categories/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/transactions/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/summary/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/subscriptions/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/setu/*', clerkMiddleware({ publishableKey, secretKey }));
app.use('/bills/*', clerkMiddleware({ publishableKey, secretKey }));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    throw new HTTPException(401, { res: err.getResponse() });
  }
  return c.json({ error: err.message }, 500);
});

const routes = app
  .route('/users', Users)
  .route('/accounts', Accounts)
  .route('/categories', Categories)
  .route('/transactions', Transaction)
  .route('/summary', Summary)
  .route('/subscriptions', Subscription)
  .route('/setu', Setu)
  .route('/webhook', Webhook)
  .route('/bills', Bills)
  .route('/remainder', Remainder);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

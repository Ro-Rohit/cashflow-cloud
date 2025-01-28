import { Hono } from 'hono';

import {
  NewCheckout,
  cancelSubscription,
  createCheckout,
  getSubscription,
  updateSubscription,
  listDiscounts,
} from '@lemonsqueezy/lemonsqueezy.js';
import { getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { db } from '@/db';
import { SubscriptionStatusType, invoiceTable, subscriptionsTable, usersTable } from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { pricingPlans } from '@/lib/const';
import { clerkClient } from '@clerk/nextjs/server';
import { configureLemonSqueezy } from '@/lib/lemon-squeezy';

const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const REDIRECT_URL = `${process.env.NEXT_PUBLIC_APP_URl}/settings`;

const app = new Hono()
  .get('/discount-codes', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    configureLemonSqueezy();

    const discountCodesList = await listDiscounts({ filter: { storeId: STORE_ID } });

    if (discountCodesList.error) {
      return c.json({ error: 'Internal server error' }, 500);
    }

    const activeDiscounts = discountCodesList.data.data.filter((d) => {
      const startsAt = d.attributes.starts_at ? new Date(d.attributes.starts_at) : null;
      const expiresAt = d.attributes.expires_at ? new Date(d.attributes.expires_at) : null;
      const now = new Date();
      if (startsAt && expiresAt) {
        return startsAt <= now && expiresAt >= now;
      }

      if (startsAt && !expiresAt) {
        return startsAt <= now;
      }

      if (!startsAt && expiresAt) {
        return expiresAt >= now;
      }

      return true;
    });

    const data = activeDiscounts.map((discount) => ({
      discountId: discount.id,
      name: discount.attributes.name,
      code: discount.attributes.code,
      duration: discount.attributes.duration,
      amount: discount.attributes.amount,
      amountType: discount.attributes.amount_type,
      maxRedemptions: discount.attributes.max_redemptions,
      expiresAt: discount.attributes.expires_at,
      startsAt: discount.attributes.starts_at,
    }));

    return c.json({ data });
  })
  .get('/subscription-invoice', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const invoiceData = await db
      .select()
      .from(invoiceTable)
      .innerJoin(
        subscriptionsTable,
        eq(invoiceTable.subscriptionId, subscriptionsTable.lemonSqueezyId)
      )
      .where(and(eq(subscriptionsTable.userId, auth.userId)));

    if (!invoiceData) {
      return c.json({ error: 'Internal server error' }, 500);
    }

    const data = invoiceData.map((data) => ({
      id: data.invoice.id,
      tax: data.invoice.tax,
      total: data.invoice.total,
      subtotal: data.invoice.subtotal,
      discountTotal: data.invoice.discountTotal,
      userEmail: data.invoice.userEmail,
      userName: data.invoice.userName,
      cardBrand: data.invoice.cardBrand,
      cardLastFour: data.invoice.cardLastFour,
      createdAt: data.invoice.createdAt,
      invoiceUrl: data.invoice.invoiceUrl,
      plan: data.subscriptions.variantName,
      status: data.invoice.status,
      billingReason: data.invoice.billionReason,
    }));

    return c.json({ data });
  })
  .get('/active-subscription/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.valid('param');
    if (!id) {
      return c.json({ error: 'Bad request: id is required' }, 400);
    }

    const [activeSubscription] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(eq(subscriptionsTable.userId, auth.userId), gte(subscriptionsTable.lemonSqueezyId, id))
      );

    if (!activeSubscription) {
      return c.json({ data: null });
    }
    return c.json({ data: activeSubscription });
  })
  .post(
    '/checkout',
    zValidator('json', z.object({ variantId: z.number(), code: z.string().optional() })),
    async (c) => {
      configureLemonSqueezy();

      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, auth.userId));
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (!STORE_ID) {
        return c.json({ error: 'Internal server error' }, 500);
      }

      const { variantId, code } = c.req.valid('json');
      if (!variantId) {
        return c.json({ error: 'Bad request: variantId is required' }, 400);
      }

      const checkoutOptions: NewCheckout = {
        checkoutData: {
          name: user.username,
          email: user.email,
          discountCode: code,
          billingAddress: {
            country: 'IN',
            zip: user.postalCode,
          },
          custom: {
            user_id: user.id,
          },
        },

        productOptions: {
          redirectUrl: REDIRECT_URL,
        },
      };

      const createdCheckout = await createCheckout(STORE_ID, variantId, checkoutOptions);

      if (createdCheckout.error) {
        return c.json({ error: 'Internal server error' }, 500);
      }

      return c.json({ url: createdCheckout.data.data.attributes.url }, 201);
    }
  )
  .post(
    '/cancel-subscription',
    zValidator('json', z.object({ lemonSqueezyId: z.string() })),

    async (c) => {
      configureLemonSqueezy();

      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { lemonSqueezyId } = c.req.valid('json');
      if (!lemonSqueezyId) {
        return c.json({ error: 'Bad request: id is required' }, 400);
      }

      const [activeSubscription] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.lemonSqueezyId, lemonSqueezyId));

      if (!activeSubscription) {
        return c.json({ error: 'Bad Request: no active subscription found' }, 400);
      }

      const cancelledSub = await cancelSubscription(activeSubscription.lemonSqueezyId);

      if (!cancelledSub) {
        return c.json({ error: 'Internal server error: no response from LemonSqueezy' }, 500);
      }

      const cancelled_data = cancelledSub.data?.data.attributes;

      if (!cancelled_data) {
        return c.json({ error: 'Internal server error: Data not found' }, 500);
      }

      const [updatedDBSubscription] = await db
        .update(subscriptionsTable)
        .set({
          status: (cancelled_data.status as SubscriptionStatusType) || 'cancelled',
          endsAt: cancelled_data.ends_at ? new Date(cancelled_data.ends_at) : undefined,
          renewsAt: new Date(cancelled_data.renews_at),
          updatedAt: new Date(cancelled_data.updated_at),
          trialEndsAt: cancelled_data.trial_ends_at
            ? new Date(cancelled_data.trial_ends_at)
            : undefined,
        })
        .where(eq(subscriptionsTable.lemonSqueezyId, lemonSqueezyId))
        .returning({ lemonSqueezyId: subscriptionsTable.lemonSqueezyId });

      if (!updatedDBSubscription) {
        return c.json({ error: 'Internal server error: failed to update subscription in DB' }, 500);
      }

      return c.json({ data: updatedDBSubscription }, 201);
    }
  )
  .patch(
    '/update-subscription',
    zValidator(
      'json',
      z.object({
        lemonSqueezyId: z.string(),
        variantId: z.number().optional(),
        paused: z.boolean().optional(),
      })
    ),

    async (c) => {
      configureLemonSqueezy();

      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { lemonSqueezyId, paused, variantId } = c.req.valid('json');
      if (!lemonSqueezyId) {
        return c.json({ error: 'Bad request: id is required' }, 400);
      }

      const [activeSubscription] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.lemonSqueezyId, lemonSqueezyId));

      if (!activeSubscription) {
        return c.json({ error: 'Bad Request: no active subscription found' }, 400);
      }

      let updatedSub;
      if (variantId) {
        updatedSub = await updateSubscription(activeSubscription.lemonSqueezyId, {
          variantId: variantId,
        });
      } else {
        updatedSub = await updateSubscription(activeSubscription.lemonSqueezyId, {
          pause: paused ? { mode: 'void' } : null,
        });
      }

      if (!updatedSub) {
        return c.json({ error: 'Internal server error: no response from LemonSqueezy' }, 500);
      }

      const updatedSub_data = updatedSub.data?.data.attributes;

      if (!updatedSub_data || !updatedSub.data) {
        return c.json({ error: 'Internal server error: Data not found' }, 500);
      }

      console.log('updated_sub', updatedSub_data);
      const [updatedDbSubscription] = await db
        .update(subscriptionsTable)
        .set({
          userId: activeSubscription.userId,
          variantId: updatedSub_data.variant_id,
          orderId: updatedSub_data.order_id,
          variantName: updatedSub_data.variant_name,
          productName: updatedSub_data.product_name,
          price: variantId
            ? getVariantByVariantId(updatedSub_data.variant_id)?.price.toString() ||
              updatedSub_data.product_name
            : activeSubscription.price,
          status: updatedSub_data.status as SubscriptionStatusType,
          pausedAt: updatedSub_data.pause !== null && paused ? new Date() : undefined,
          isPaused: updatedSub_data.pause !== null,
          renewsAt: new Date(updatedSub_data.renews_at),
          createdAt: new Date(updatedSub_data.created_at),
          updatedAt: new Date(updatedSub_data.updated_at),
          trialEndsAt: updatedSub_data.trial_ends_at
            ? new Date(updatedSub_data.trial_ends_at)
            : undefined,
          endsAt: updatedSub_data.ends_at
            ? new Date(updatedSub_data.ends_at)
            : new Date(new Date().setDate(new Date(updatedSub_data.renews_at).getDate() - 1)),
        })
        .returning({ lemonSqueezyId: subscriptionsTable.lemonSqueezyId });

      if (!updatedDbSubscription) {
        return c.json({ error: 'Internal server error: failed to update subscription in DB' }, 500);
      }

      const client = await clerkClient();
      await client.users.updateUserMetadata(auth.userId, {
        publicMetadata: {
          subscriptionId: updatedDbSubscription.lemonSqueezyId,
          plan:
            updatedSub_data.pause !== null
              ? 'free'
              : getPlanCodeByName(updatedSub_data.variant_name),
        },
      });

      return c.json({ data: updatedDbSubscription }, 201);
    }
  )
  .post(
    '/update-payment-method',
    zValidator('json', z.object({ lemonSqueezyId: z.string() })),

    async (c) => {
      configureLemonSqueezy();

      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { lemonSqueezyId } = c.req.valid('json');
      if (!lemonSqueezyId) {
        return c.json({ error: 'Bad request: id is required' }, 400);
      }

      const [activeSubscription] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.lemonSqueezyId, lemonSqueezyId));

      if (!activeSubscription) {
        return c.json({ error: 'Bad Request: no active subscription found' }, 400);
      }

      const subscription = await getSubscription(lemonSqueezyId);

      if (subscription.error) {
        throw new Error(subscription.error.message);
      }

      return c.json({ url: subscription.data.data.attributes.urls }, 201);
    }
  );

const getVariantByVariantId = (variantId: number) => {
  return pricingPlans.flatMap((plan) => plan.variants || []).find((v) => v.id === variantId);
};

const getPlanCodeByName = (name: string) => {
  if (name.includes('Go Pro')) return 'pro';
  if (name.includes('Unlimited-SAAS')) return 'unlimited';
  return 'free';
};

export default app;

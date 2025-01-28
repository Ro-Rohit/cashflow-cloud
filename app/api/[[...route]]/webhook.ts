import { db } from '@/db';
import {
  SubscriptionStatusType,
  invoiceTable,
  subscriptionsTable,
  usersTable,
  insertAccountsSchema,
} from '@/db/schema';
import { pricingPlans } from '@/lib/const';
import { configureLemonSqueezy } from '@/lib/lemon-squeezy';
import { getFiDataBySessionId, createDataSession } from '@/lib/setu-actions';
import { webhookHasData, webhookHasMeta } from '@/lib/typeguard';
import { convertAmountToMiliUnit } from '@/lib/utils';
import { clerkClient } from '@clerk/nextjs/server';
import { getAuth } from '@hono/clerk-auth';
import { Subscription, SubscriptionInvoice } from '@lemonsqueezy/lemonsqueezy.js';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

const updateMetaData = async (data: any, userId: string) => {
  const ckClient = await clerkClient();

  await ckClient.users.updateUserMetadata(userId, {
    publicMetadata: { ...data },
  });
};

const app = new Hono()
  .post('/webhook/consent', async (c) => {
    const auth = getAuth(c);
    if (!auth || !auth.userId) {
      return c.text('Unauthorized', 401);
    }
    try {
      const body = await c.req.json();

      if (body.type === 'CONSENT_STATUS_UPDATE') {
        if (body.data.status === 'ACTIVE') {
          await createDataSession(body.consentId);

          await updateMetaData(
            {
              consentId: body.consentId as string,
            },
            auth.userId
          );
        }
      }
      if (body.type === 'SESSION_STATUS_UPDATE') {
        await updateMetaData(
          {
            sessionId: body.dataSessionId as string,
          },
          auth.userId
        );

        if (body.data.status === 'COMPLETED') {
          const res = await getFiDataBySessionId(body.dataSessionId);

          if (res.data) {
            const data = res.data;
            console.log(data);
            // const holderData = data.profile.holders.holder[0];
            // const summaryData = data.summary;
            // const transactionsData = data.transactions.transaction as any[];
            // const formattedData: typeof insertAccountsSchema._type = {
            //   name: holderData.name as string,
            //   userId: auth.userId,
            //   email: holderData.email as string,
            //   nominee: holderData.nominee as string,
            //   accountType: summaryData.type as string,
            //   accountNumber: data.masked_account_number as string,
            //   branch: summaryData.branch as string,
            //   ifscCode: summaryData.ifscCode as string,
            //   micrCode: summaryData.micrCode as string,
            //   dob: holderData.dob as string,
            //   // mobile: holderData.mobile as string,
            //   balance:
            //     convertAmountToMiliUnit(parseFloat(summaryData.balance as string)) ?? undefined,
            // };
          }
        }
      }

      return c.json({ message: 'Setu Webhook processed and data stored' }, 200);
    } catch (error) {
      console.error('Error handling webhook:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .post('/subscriptions', async (c) => {
    configureLemonSqueezy();
    if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
      return new Response('Lemon Squeezy Webhook Secret not set in .env', {
        status: 500,
      });
    }

    try {
      const rawBody = await c.req.text();
      const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign']
      );

      // Generate the HMAC signature
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));

      // Convert the generated signature to a hex string
      const digest = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const signatureHeader = c.req.header('X-Signature');
      if (!signatureHeader) {
        return c.text('Missing signature header', 400);
      }

      if (!timingSafeEqualHex(digest, signatureHeader)) {
        return c.text('Invalid signature.', 401);
      }

      const data = JSON.parse(rawBody) as unknown;

      if (!webhookHasMeta(data) || !webhookHasData(data)) {
        return c.text('Invalid webhook data', 400);
      }

      const { meta } = data;
      if (!meta.custom_data || !meta.event_name) {
        return c.text('Invalid meta structure', 400);
      }

      const userId = meta.custom_data.user_id;
      const eventName = meta.event_name;

      if (eventName.startsWith('subscription_payment_')) {
        const eventData: SubscriptionInvoice = data;
        const attributes = eventData.data.attributes;

        const createDbInvoice = await db
          .insert(invoiceTable)
          .values({
            id: eventData.data.id,
            tax: attributes.tax as number,
            status: attributes.status,
            billionReason: attributes.billing_reason as string,
            invoiceUrl: attributes.urls.invoice_url as string,
            total: attributes.total as number,
            subtotal: attributes.subtotal as number,
            subscriptionId: attributes.subscription_id.toString(),
            discountTotal: attributes.discount_total as number,
            userEmail: attributes.user_email as string,
            userName: attributes.user_name as string,
            cardBrand: attributes.card_brand as string,
            cardLastFour: attributes.card_last_four as string,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: invoiceTable.id });

        if (!createDbInvoice) {
          return c.json({ error: 'Failed to create invoice' }, 500);
        }

        return c.text('Invoice processed', 200);
      } else if (eventName.startsWith('subscription_')) {
        const eventData: Subscription = data;
        const attributes = eventData.data.attributes;
        const variantId = attributes.variant_id;

        const planVariant = getVariantByVariantId(variantId);

        const values = {
          lemonSqueezyId: eventData.data.id,
          variantId: variantId,
          variantName: attributes.variant_name as string,
          productName: attributes.product_name as string,
          orderId: attributes.order_id as number,
          isPaused: false,
          status: attributes.status as SubscriptionStatusType,
          renewsAt: new Date(attributes.renews_at as string),
          endsAt: new Date(attributes.ends_at as string),
          trialEndsAt: new Date(attributes.trial_ends_at as string),
          price: planVariant?.price.toString() || '',
          userId: userId,
        };

        const createDbSubscription = await db
          .insert(subscriptionsTable)
          .values(values)
          .onConflictDoUpdate({
            target: subscriptionsTable.lemonSqueezyId,
            set: values,
          })
          .returning({ lemonSqueezyId: subscriptionsTable.lemonSqueezyId });

        if (!createDbSubscription) {
          return c.json({ error: 'Failed to create subscription' }, 500);
        }

        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscriptionId: eventData.data.id,
            customerId: attributes.customer_id,
            plan: getPlanStatus(attributes.status, attributes.variant_name),
          },
        });

        await db
          .update(usersTable)
          .set({ customerId: attributes.customer_id })
          .where(eq(usersTable.id, userId));
        return c.text('Subscription processed', 200);
      }

      return c.text('Unhandled event', 200);
    } catch (error) {
      console.error('Webhook processing error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

const getVariantByVariantId = (variantId: number) => {
  return pricingPlans.flatMap((plan) => plan.variants || []).find((v) => v.id === variantId);
};

// Utility function for timing-safe comparison of hex strings
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const getPlanCodeByName = (name: string) => {
  if (name.includes('Go Pro')) return 'pro';
  if (name.includes('Unlimited-SAAS')) return 'unlimited';
  return 'free';
};

const getPlanStatus = (status: SubscriptionStatusType | 'pause', variantName: string) => {
  switch (status) {
    case 'active':
      return getPlanCodeByName(variantName);
    case 'on_trial':
      return getPlanCodeByName(variantName);
    case 'cancelled':
      return getPlanCodeByName(variantName);
    case 'unpaid':
      return 'free';
    case 'past_due':
      return 'free';
    case 'expired':
      return 'free';
    case 'pause':
      return 'free';
    default:
      return 'free';
  }
};

export default app;

/*
const accounts=res.data.fips[0].accounts
const acc =  acccounts[i].data.account
const  accNo = acc.maskedAccNumber
acc.profile.holder.name;
acc.profile.holder.email;
acc.profile.holder.dob;
acc.profile.holder.nominee;
acc.profile.holder.mobile;

const sumry = acccounts[i].data.summary
sumry.currentBalance
sumry.branch
sumry.isfcCode
sumry.micrCode
const accType = sumry.type;

//bankName! AccountName!, linkRefNumber!

accountName --type-[no]
bankName --> !external Api

//transaction


{
  "status": "PARTIAL", // combined data session status
  "format": "json",
  "fips": [
    {
      "accounts": [
        {
          "linkRefNumber": "b2329f47-0a6f-4131-adb5-9ef7b4c1ca6a",
          "maskedAccNumber": "XXXXXX4373",
          "status": "DELIVERED" // individual account FI status
          "data": {
            "account": {
              "linkedAccRef": "b2329f47-0a6f-4131-adb5-9ef7b4c1ca6a",
              "maskedAccNumber": "XXXXXX4373",
              "type": "deposit",
              "version": "1.1",
              "profile": {
                "holders": {
                  "type": "SINGLE",
                  "holder": {
                    "address": "8/1190, 5th Cross, 3rd Main, 7th Block, Jayanagar, Bangalore - 560011",
                    "ckycCompliance": "true",
                    "dob": "1947-08-15",
                    "email": "mail@mail.com",
                    "landline": "",
                    "mobile": "8569884373",
                    "name": "Akshay Kumar",
                    "nominee": "REGISTERED",
                    "pan": "AAAAA0000A"
                  }
                }
              },
              "summary": {
                "currentBalance": "101666.33",
                "currency": "INR",
                "branch": "Jayanagar 4th Block",
                "balanceDateTime": "2020-06-22T07:50:00+00:00",
                "currentODLimit": "0",
                "drawingLimit": "0",
                "exchgeRate": " ",
                "facility": "OD",
                "ifscCode": "ICIC0001124",
                "micrCode": "500240246",
                "openingDate": "2004-08-06",
                "status": "ACTIVE",
                "type": "SAVINGS",
                "Pending": {
                  "transactionType": "DEBIT",
                  "amount": "0"
                }
              },
              "transactions": {
                "startDate": "2021-04-01",
                "endDate": "2021-09-30"
              }
            }
          },
        }
      ],
      "fipID": "Setu-FIP"
    },
    {
      "accounts": [
        {
          "linkRefNumber": "b2329f47-0a6f-4131-adb5-9ef7b4c1ca6a",
          "maskedAccNumber": "XXXXXX4373",
          "FIstatus": "FAILED",  // individual account FI status
          "data": null
        }
      ],
      "fipID": "ACME-FIP"
    }
  ],
  "id": "378ec65c-f558-49fc-89ea-e880c2cf88b3",
  "dataRange": {
    "from": "2021-04-01T00:00Z",
    "to": "2021-09-30T00:00Z"
  },
  "consentId": "d4f40bd9-a22f-4408-a622-4e8a1e4fbda6"
}

*/

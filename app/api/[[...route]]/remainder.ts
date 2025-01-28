import { db } from '@/db';
import { billsTable, usersTable } from '@/db/schema';
import { generateBillReminderTemplate, sendEmail } from '@/lib/resend-emails';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { Hono } from 'hono';

const app = new Hono().get('/', async (c) => {
  const bills = await db
    .select({
      name: usersTable.username,
      email: usersTable.email,
      id: billsTable.id,
      amount: billsTable.amount,
      dueDate: billsTable.dueDate,
    })
    .from(billsTable)
    .innerJoin(usersTable, eq(billsTable.userId, usersTable.id))
    .where(
      and(
        eq(billsTable.status, 'pending'),
        eq(billsTable.remind, true),
        gte(billsTable.dueDate, sql`CURRENT_DATE - INTERVAL '5 days'`),
        lte(billsTable.dueDate, sql`CURRENT_DATE`)
      )
    );

  if (!bills || bills.length === 0) {
    return c.text('No bills found', 204);
  }

  await Promise.all(
    bills.map(async (item) => {
      await sendEmail(
        item.email,
        'Bill Reminder',
        generateBillReminderTemplate({
          customerName: item.name,
          billNumber: item.id,
          dueDate: item.dueDate.toISOString(),
          amount: item.amount,
        })
      );
    })
  );

  return c.text('Success: Notification sent', 200);
});

export default app;

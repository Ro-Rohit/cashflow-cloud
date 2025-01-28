import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { v4 } from 'uuid';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const usersTable = pgTable('users', {
  id: text('user_id').primaryKey(),
  customerId: integer('customer_id'),
  username: text('name').notNull(),
  email: text('email').unique().notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  phone: text('phone').notNull(),
  dob: timestamp('date_of_birth', { mode: 'date' }).notNull(),
  postalCode: text('postal_code').notNull(),
});

export const insertUsersSchema = createInsertSchema(usersTable, {
  id: z.string(),
  customerId: z.number().optional().nullable(),
  username: z.string(),
  email: z.string().email(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  postalCode: z.string(),
  dob: z.coerce.date(),
});

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  accounts: many(accountsTable),
  categories: many(categoriesTable),
  verificationTokens: many(verificationTokenTable),
  bills: many(billsTable),
  subscriptions: one(subscriptionsTable, {
    fields: [usersTable.id],
    references: [subscriptionsTable.userId],
  }),
}));

export const subscriptionStatusEnum = pgEnum('subscription_status_enum', [
  'active',
  'unpaid',
  'cancelled',
  'paused',
  'past_due',
  'expired',
  'on_trial',
]);

export const subscriptionStatusEnumSchema = z.enum(subscriptionStatusEnum.enumValues);
export type SubscriptionStatusType = (typeof subscriptionStatusEnumSchema)['_type'];

export const subscriptionsTable = pgTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  lemonSqueezyId: text('lemonSqueezy_id').unique().notNull(),
  variantId: integer('variant_id').notNull(),
  productName: text('product_name').notNull(),
  variantName: text('variant_name').notNull(),
  orderId: integer('order_id').notNull(),
  status: subscriptionStatusEnum('subscription_status').notNull(),
  price: text('price').notNull(),
  renewsAt: timestamp('renews_at', { mode: 'date' }).notNull(),
  endsAt: timestamp('ends_at', { mode: 'date' }).notNull(),
  isPaused: boolean('isPaused').default(false).notNull(),
  pausedAt: timestamp('paused_at', { mode: 'date' }),
  trialEndsAt: timestamp('trialEnds_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: text('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
});

export const insertSubscriptionsSchema = createInsertSchema(subscriptionsTable, {
  id: z.string(),
  lemonSqueezyId: z.string(),
  variantId: z.number(),
  productName: z.string(),
  variantName: z.string(),
  orderId: z.number(),
  status: subscriptionStatusEnumSchema,
  price: z.string(),
  renewsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isPaused: z.boolean(),
  pausedAt: z.coerce.date().optional().nullable(),
  trialEndsAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable(),
  userId: z.string(),
});

export const subscriptionsRelations = relations(subscriptionsTable, ({ one, many }) => ({
  invoiceTable: many(invoiceTable),
  usersTable: one(usersTable, {
    fields: [subscriptionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const invoiceStatusEnum = pgEnum('invoice_status_enum', [
  'paid',
  'pending',
  'void',
  'refunded',
  'partial_refund',
]);

export const invoiceStatusEnumSchema = z.enum(invoiceStatusEnum.enumValues);
export type invoiceStatusType = (typeof invoiceStatusEnumSchema)['_type'];

export const invoiceTable = pgTable('invoice', {
  id: text('id').primaryKey(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  cardBrand: text('card_brand'),
  cardLastFour: text('card_last_four'),
  discountTotal: integer('discount_total'),
  subtotal: integer('subtotal').notNull(),
  status: invoiceStatusEnum('invoice_status').notNull(),
  billionReason: text('billion_reason').notNull(),
  tax: integer('tax').notNull(),
  invoiceUrl: text('invoice_url').notNull(),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
  subscriptionId: text('subscription_id')
    .references(() => subscriptionsTable.lemonSqueezyId, {
      onDelete: 'set null',
    })
    .notNull(),
});

export const invoiceRelations = relations(invoiceTable, ({ one }) => ({
  subscriptionsTable: one(subscriptionsTable, {
    fields: [invoiceTable.subscriptionId],
    references: [subscriptionsTable.lemonSqueezyId],
  }),
}));

export const insertInvoiceSchema = createInsertSchema(invoiceTable, {
  id: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  cardBrand: z.string(),
  cardLastFour: z.string(),
  discountTotal: z.number(),
  subtotal: z.number(),
  status: invoiceStatusEnumSchema,
  billionReason: z.string(),
  tax: z.number(),
  invoiceUrl: z.string(),
  total: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable(),
  subscriptionId: z.string(),
});

export const creationTypeEnum = pgEnum('creation_type_enum', ['local', 'remote']);

export const creationTypeEnumSchema = z.enum(creationTypeEnum.enumValues);

export const accountsTable = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text('name').notNull(),
  creationType: creationTypeEnum('creation_type').default('local').notNull(),
  accountType: text('account_type'),
  balance: integer('balance'),
  accountNumber: text('account_number'),
  email: text('email'),
  dob: text('dob'),
  nominee: text('nominee'),
  ifscCode: text('ifsc_code'),
  micrCode: text('micr_code'),
  address: text('address'),
  lastFetchDate: timestamp('last_fetch_date', { mode: 'date' }),
  branch: text('branch'),
  archieve: boolean('archieve').default(false).notNull(),
  userId: text('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
});

export const accountsRelations = relations(accountsTable, ({ many, one }) => ({
  transactions: many(transactionsTable),
  usersTable: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));
export const insertAccountsSchema = createInsertSchema(accountsTable);

export const categoriesTable = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text('name').unique().notNull(),
  budget: integer('budget').notNull(),
  userId: text('user_id').notNull(),
});

export const categoriesRelations = relations(categoriesTable, ({ many, one }) => ({
  transactions: many(transactionsTable),
  usersTable: one(usersTable, {
    fields: [categoriesTable.userId],
    references: [usersTable.id],
  }),
}));

export const insertCategoriesSchema = createInsertSchema(categoriesTable);

export const transactionsTable = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  notes: text('notes'),
  amount: integer('amount').notNull(),
  creationType: creationTypeEnum('creation_type').default('local').notNull(),
  archieve: boolean('archieve').default(false).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  payee: text('payee').notNull(),
  categoryId: text('category_id').references(() => categoriesTable.id, { onDelete: 'set null' }),
  accountId: text('account_id')
    .references(() => accountsTable.id, { onDelete: 'cascade' })
    .notNull(),
});

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  category: one(categoriesTable, {
    fields: [transactionsTable.categoryId],
    references: [categoriesTable.id],
  }),
  account: one(accountsTable, {
    fields: [transactionsTable.accountId],
    references: [accountsTable.id],
  }),
}));

export const insertTransactionsSchema = createInsertSchema(transactionsTable, {
  id: z.string(),
  notes: z.string().optional().nullable(),
  amount: z.number(),
  payee: z.string(),
  creationType: creationTypeEnumSchema,
  archieve: z.boolean(),
  categoryId: z.string().optional().nullable(),
  accountId: z.string(),
  date: z.coerce.date(),
});

export const tokenTypeEnum = pgEnum('token_type_enum', ['account_delete', 'email_verification']);
export const tokenTypeEnumSchema = z.enum(tokenTypeEnum.enumValues);
export type tokenTypes = (typeof tokenTypeEnumSchema)['_type'];

export const verificationTokenTable = pgTable('verification_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  token: text('token').notNull(),
  email: text('email').notNull(),
  tokenType: tokenTypeEnum('token_type').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  userId: text('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
});

export const verificationTokenRelation = relations(verificationTokenTable, ({ one }) => ({
  usersTable: one(usersTable, {
    fields: [verificationTokenTable.userId],
    references: [usersTable.id],
  }),
}));

export const insertVerificationTokenSchema = createInsertSchema(verificationTokenTable, {
  id: z.string(),
  email: z.string(),
  token: z.string(),
  tokenType: tokenTypeEnumSchema,
  createdAt: z.date(),
  expiresAt: z.date(),
  userId: z.string(),
});

export const BillStatusEnum = pgEnum('bill_status_enum', ['pending', 'overdue', 'paid']);
export const BillStatusEnumSchema = z.enum(BillStatusEnum.enumValues);
export type BillStatusType = (typeof BillStatusEnumSchema)['_type'];

export const BillTypeEnum = pgEnum('bill_type_enum', ['recurring', 'one-time']);
export const BillTypeEnumSchema = z.enum(BillTypeEnum.enumValues);
export type BillTypeEnumType = (typeof BillTypeEnumSchema)['_type'];

export const billsTable = pgTable('bills', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  status: BillStatusEnum('status').notNull(),
  type: BillTypeEnum('type').default('one-time').notNull(),
  remind: boolean('remind').default(false).notNull(),
  dueDate: timestamp('expires_at', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  userId: text('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
});

export const BillsRelation = relations(billsTable, ({ one }) => ({
  usersTable: one(usersTable, {
    fields: [billsTable.userId],
    references: [usersTable.id],
  }),
}));

export const insertBillSchema = createInsertSchema(billsTable, {
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  status: BillStatusEnumSchema,
  type: BillTypeEnumSchema,
  remind: z.boolean().default(false),
  dueDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  userId: z.string(),
});

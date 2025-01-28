CREATE TYPE "public"."bill_status_enum" AS ENUM('pending', 'overdue', 'paid');--> statement-breakpoint
CREATE TYPE "public"."bill_type_enum" AS ENUM('recurring', 'one-time');--> statement-breakpoint
CREATE TYPE "public"."creation_type_enum" AS ENUM('local', 'remote');--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('paid', 'pending', 'void', 'refunded', 'partial_refund');--> statement-breakpoint
CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'unpaid', 'cancelled', 'paused', 'past_due', 'expired', 'on_trial');--> statement-breakpoint
CREATE TYPE "public"."token_type_enum" AS ENUM('account_delete', 'email_verification');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"creation_type" "creation_type_enum" DEFAULT 'local' NOT NULL,
	"account_type" text,
	"balance" integer,
	"account_number" text,
	"email" text,
	"dob" text,
	"nominee" text,
	"ifsc_code" text,
	"micr_code" text,
	"address" text,
	"branch" text,
	"archieve" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "bill_status_enum" NOT NULL,
	"type" "bill_type_enum" DEFAULT 'one-time' NOT NULL,
	"remind" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"budget" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"card_brand" text,
	"card_last_four" text,
	"discount_total" integer,
	"subtotal" integer NOT NULL,
	"invoice_status" "invoice_status_enum" NOT NULL,
	"billion_reason" text NOT NULL,
	"tax" integer NOT NULL,
	"invoice_url" text NOT NULL,
	"total" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"subscription_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"lemonSqueezy_id" text NOT NULL,
	"variant_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"variant_name" text NOT NULL,
	"order_id" integer NOT NULL,
	"subscription_status" "subscription_status_enum" NOT NULL,
	"price" text NOT NULL,
	"renews_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"isPaused" boolean DEFAULT false NOT NULL,
	"paused_at" timestamp,
	"trialEnds_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	CONSTRAINT "subscriptions_lemonSqueezy_id_unique" UNIQUE("lemonSqueezy_id"),
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"notes" text,
	"amount" integer NOT NULL,
	"creation_type" "creation_type_enum" DEFAULT 'local' NOT NULL,
	"archieve" boolean DEFAULT false NOT NULL,
	"date" timestamp NOT NULL,
	"payee" text NOT NULL,
	"category_id" text,
	"account_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"phone" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"postal_code" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"token_type" "token_type_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscription_id_subscriptions_lemonSqueezy_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("lemonSqueezy_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
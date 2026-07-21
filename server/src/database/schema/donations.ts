import {
  bigint,
  index,
  jsonb,
  pgEnum,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { users } from './users'
import { campaigns } from './campaigns'

// Payment lifecycle for a single checkout attempt (docs/PAYMENT_ARCHITECTURE.md).
export const paymentStatus = pgEnum('payment_status', [
  'pending',
  'success',
  'failed',
  'cancelled',
  'expired',
])

// High-level rail chosen at checkout. The specific provider (mpesa, crdb, ...)
// is stored as free text so new providers need no migration.
export const paymentMethod = pgEnum('payment_method', ['mobile_money', 'bank'])

/**
 * A completed donation. Created only after a payment is verified
 * (docs/BUSINESS_RULES.md: Donation Rules). Immutable and never deleted, so
 * there is no soft-delete column here.
 */
export const donations = pgTable(
  'donations',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    donorId: bigint('donor_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    campaignId: bigint('campaign_id', { mode: 'number' })
      .notNull()
      .references(() => campaigns.id),
    // Whole Tanzanian Shillings (database/DATABASE_SCHEMA.md).
    amount: bigint('amount', { mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 8 }).notNull().default('TZS'),
    // Every donation carries its payment reference and a receipt number.
    paymentReference: varchar('payment_reference', { length: 64 }).notNull(),
    receiptNumber: varchar('receipt_number', { length: 32 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('donations_receipt_number_unique').on(table.receiptNumber),
    index('donations_donor_idx').on(table.donorId),
    index('donations_campaign_idx').on(table.campaignId),
  ],
)

/**
 * One row per checkout attempt against the payment provider. Records every
 * attempt (docs/PAYMENT_ARCHITECTURE.md: Security) and links to the resulting
 * donation once payment succeeds.
 */
export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    // Unique payment reference (flows/payment-flow.md: one reference per payment).
    reference: varchar('reference', { length: 64 }).notNull(),
    donorId: bigint('donor_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    campaignId: bigint('campaign_id', { mode: 'number' })
      .notNull()
      .references(() => campaigns.id),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 8 }).notNull().default('TZS'),
    method: paymentMethod('method').notNull(),
    provider: varchar('provider', { length: 40 }).notNull(),
    status: paymentStatus('status').notNull().default('pending'),
    // Capability secret embedded in the checkout URL; the callback must present
    // it to prove the confirmation is authentic for this transaction.
    checkoutToken: varchar('checkout_token', { length: 64 }).notNull(),
    checkoutUrl: text('checkout_url').notNull(),
    // Raw provider payloads, kept for audit and debugging.
    providerResponse: jsonb('provider_response'),
    donationId: bigint('donation_id', { mode: 'number' }).references(() => donations.id),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('payment_transactions_reference_unique').on(table.reference),
    index('payment_transactions_donor_idx').on(table.donorId),
    index('payment_transactions_status_idx').on(table.status),
  ],
)

export type DonationRow = typeof donations.$inferSelect
export type NewDonationRow = typeof donations.$inferInsert
export type PaymentTransactionRow = typeof paymentTransactions.$inferSelect
export type NewPaymentTransactionRow = typeof paymentTransactions.$inferInsert

import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users'

// A donor's request to become a fundraiser (Decision 020, api/authentication.md).
// An administrator reviews it; approval promotes the applicant's role to
// fundraiser. A donor may hold only one open (pending) application at a time,
// but a rejected applicant may re-apply.
export const fundraiserApplicationStatus = pgEnum('fundraiser_application_status', [
  'pending',
  'approved',
  'rejected',
])

export const fundraiserApplications = pgTable(
  'fundraiser_applications',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    // The organisation or individual name the applicant fundraises under.
    displayName: varchar('display_name', { length: 150 }).notNull(),
    causeDescription: text('cause_description').notNull(),
    // National ID or organisation registration number. The future home for KYC.
    identityReference: varchar('identity_reference', { length: 120 }).notNull(),
    contactPhone: varchar('contact_phone', { length: 30 }).notNull(),
    status: fundraiserApplicationStatus('status').notNull().default('pending'),
    reviewedBy: bigint('reviewed_by', { mode: 'number' }).references(() => users.id),
    decisionReason: text('decision_reason'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('fundraiser_applications_user_idx').on(table.userId),
    index('fundraiser_applications_status_idx').on(table.status),
  ],
)

export type FundraiserApplicationRow = typeof fundraiserApplications.$inferSelect
export type NewFundraiserApplicationRow = typeof fundraiserApplications.$inferInsert

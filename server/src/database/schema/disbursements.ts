import {
  bigint,
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns'
import { beneficiaries } from './beneficiaries'
import { users } from './users'

// Draft states per api/disbursements.md. 'pending_approval' or 'approved' is
// decided at initiation by the dual-approval threshold (Decision 016).
export const disbursementStatus = pgEnum('disbursement_status', [
  'pending_approval',
  'approved',
  'processing',
  'completed',
  'failed',
  'rejected',
])

export const disbursementDecision = pgEnum('disbursement_decision', ['approved', 'rejected'])

/**
 * A fiat payout from a campaign's raised funds to a verified beneficiary
 * (docs/BUSINESS_RULES.md: Disbursement Rules). Immutable and never deleted.
 */
export const disbursements = pgTable(
  'disbursements',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    campaignId: bigint('campaign_id', { mode: 'number' })
      .notNull()
      .references(() => campaigns.id),
    beneficiaryId: bigint('beneficiary_id', { mode: 'number' })
      .notNull()
      .references(() => beneficiaries.id),
    // Whole Tanzanian Shillings.
    amount: bigint('amount', { mode: 'number' }).notNull(),
    purpose: text('purpose').notNull(),
    status: disbursementStatus('status').notNull().default('pending_approval'),
    // True when this payout was released without administrator approval, that
    // is, under the self-serve allowance (Decision 020). Such payouts count
    // toward a campaign's cumulative self-released total; dual-approved ones do
    // not.
    selfReleased: boolean('self_released').notNull().default(false),
    initiatedBy: bigint('initiated_by', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    rejectionReason: text('rejection_reason'),
    // Provider payout reference and raw payload once queued.
    payoutReference: varchar('payout_reference', { length: 64 }),
    providerResponse: jsonb('provider_response'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('disbursements_payout_reference_unique').on(table.payoutReference),
    index('disbursements_campaign_idx').on(table.campaignId),
    index('disbursements_status_idx').on(table.status),
  ],
)

/**
 * Approval or rejection decision for a disbursement requiring dual approval.
 * The initiating administrator can never approve their own disbursement
 * (enforced in the service layer, not here).
 */
export const disbursementApprovals = pgTable(
  'disbursement_approvals',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    disbursementId: bigint('disbursement_id', { mode: 'number' })
      .notNull()
      .references(() => disbursements.id),
    adminId: bigint('admin_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    decision: disbursementDecision('decision').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('disbursement_approvals_disbursement_idx').on(table.disbursementId)],
)

export type DisbursementRow = typeof disbursements.$inferSelect
export type NewDisbursementRow = typeof disbursements.$inferInsert
export type DisbursementApprovalRow = typeof disbursementApprovals.$inferSelect
export type NewDisbursementApprovalRow = typeof disbursementApprovals.$inferInsert

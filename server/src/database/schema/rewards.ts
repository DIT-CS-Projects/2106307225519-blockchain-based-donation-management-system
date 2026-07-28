import { bigint, index, pgEnum, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { users } from './users'
import { donations } from './donations'

// What earned the points. Kept as an enum so the ledger is self-describing and
// the client can label each entry without a lookup table.
export const rewardEventType = pgEnum('reward_event_type', [
  'donation', // base points, one per successful donation
  'first_donation', // one-time welcome bonus on a donor's very first donation
  'new_campaign', // bonus for supporting a campaign the donor hadn't backed before
])

/**
 * Append-only ledger of Impact Points a donor earns for engagement (Decision
 * 022). Mirrors the donations table's immutability: rows are never updated or
 * deleted, so a donor's balance is always the sum of their history and stays
 * auditable. Balance and tier are derived, never stored.
 */
export const rewardEvents = pgTable(
  'reward_events',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    type: rewardEventType('type').notNull(),
    // Whole points. Positive for every current event type; signed to leave room
    // for future adjustments without a schema change.
    points: bigint('points', { mode: 'number' }).notNull(),
    // The donation that triggered this event, when applicable. Nullable so
    // non-donation events (future: referrals, profile completion) still fit.
    donationId: bigint('donation_id', { mode: 'number' }).references(() => donations.id),
    description: text('description').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reward_events_user_idx').on(table.userId),
    // One event of each type per donation: makes awarding idempotent even if a
    // payment callback is somehow processed twice.
    uniqueIndex('reward_events_donation_type_unique').on(table.donationId, table.type),
  ],
)

export type RewardEventRow = typeof rewardEvents.$inferSelect
export type NewRewardEventRow = typeof rewardEvents.$inferInsert

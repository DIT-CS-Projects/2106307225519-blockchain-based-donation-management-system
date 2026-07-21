import { bigint, boolean, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns'
import { users } from './users'

/**
 * A beneficiary of a campaign (docs/BUSINESS_RULES.md: Beneficiary Rules).
 * Belongs to exactly one campaign; the same real-world beneficiary helped by
 * another campaign gets its own separate record (api/beneficiaries.md).
 * Must be verified before public display or receiving a disbursement.
 */
export const beneficiaries = pgTable(
  'beneficiaries',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    campaignId: bigint('campaign_id', { mode: 'number' })
      .notNull()
      .references(() => campaigns.id),
    name: varchar('name', { length: 150 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 80 }),
    location: varchar('location', { length: 150 }),
    contactInfo: text('contact_info'),
    imageUrl: text('image_url'),
    verified: boolean('verified').notNull().default(false),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: bigint('verified_by', { mode: 'number' }).references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    // Soft delete: beneficiaries are never hard-deleted (database/DATABASE_SCHEMA.md).
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('beneficiaries_campaign_idx').on(table.campaignId),
    index('beneficiaries_verified_idx').on(table.verified),
  ],
)

export type BeneficiaryRow = typeof beneficiaries.$inferSelect
export type NewBeneficiaryRow = typeof beneficiaries.$inferInsert

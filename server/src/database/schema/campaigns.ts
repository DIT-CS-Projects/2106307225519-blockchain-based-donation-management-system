import {
  bigint,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users'

// Business rules: docs/BUSINESS_RULES.md (Campaign Rules), Decision 020.
// Fundraiser campaigns start in 'pending_review' and become 'active' only after
// an administrator approves them; 'rejected' holds a declined submission.
export const campaignStatus = pgEnum('campaign_status', [
  'draft',
  'pending_review',
  'active',
  'rejected',
  'completed',
  'archived',
])

export const campaignCategory = pgEnum('campaign_category', [
  'Education',
  'Health',
  'Disaster Relief',
  'Environment',
  'Community',
  'Other',
])

export const campaigns = pgTable(
  'campaigns',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    category: campaignCategory('category').notNull(),
    imageUrl: text('image_url'),
    // The campaign owner (Decision 020): the fundraiser or administrator who
    // created it. Nullable for pre-existing platform campaigns, which only
    // administrators manage.
    ownerId: bigint('owner_id', { mode: 'number' }).references(() => users.id),
    // Whole Tanzanian Shillings (database/DATABASE_SCHEMA.md).
    targetAmount: bigint('target_amount', { mode: 'number' }).notNull(),
    raisedAmount: bigint('raised_amount', { mode: 'number' }).notNull().default(0),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    status: campaignStatus('status').notNull().default('draft'),
    // Reason recorded when an administrator rejects a submitted campaign.
    rejectionReason: text('rejection_reason'),
    featured: boolean('featured').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    // Soft delete: campaigns are never hard-deleted.
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('campaigns_status_idx').on(table.status),
    index('campaigns_category_idx').on(table.category),
    index('campaigns_featured_idx').on(table.featured),
    index('campaigns_owner_idx').on(table.ownerId),
  ],
)

export type CampaignRow = typeof campaigns.$inferSelect
export type NewCampaignRow = typeof campaigns.$inferInsert

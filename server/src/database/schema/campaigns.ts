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

// Business rules: docs/BUSINESS_RULES.md (Campaign Rules).
export const campaignStatus = pgEnum('campaign_status', [
  'draft',
  'active',
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
    // Whole Tanzanian Shillings (database/DATABASE_SCHEMA.md).
    targetAmount: bigint('target_amount', { mode: 'number' }).notNull(),
    raisedAmount: bigint('raised_amount', { mode: 'number' }).notNull().default(0),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    status: campaignStatus('status').notNull().default('draft'),
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
  ],
)

export type CampaignRow = typeof campaigns.$inferSelect
export type NewCampaignRow = typeof campaigns.$inferInsert

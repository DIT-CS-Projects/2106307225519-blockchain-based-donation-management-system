import { bigint, boolean, index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

// api/notifications.md: Notification Types.
export const notificationType = pgEnum('notification_type', [
  'donation_success',
  'donation_failed',
  'campaign_published',
  'campaign_closed',
  'campaign_goal_achieved',
  'beneficiary_updated',
  'password_changed',
  'system_announcement',
  'disbursement_completed',
  'disbursement_failed',
])

/**
 * A single recipient's notification. Broadcasts (system announcements) are
 * fanned out at creation time, one row per recipient, so the read path is
 * always a simple "where user_id = me" query.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    type: notificationType('type').notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    message: text('message').notNull(),
    link: text('link'),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_user_idx').on(table.userId),
    index('notifications_user_read_idx').on(table.userId, table.read),
  ],
)

export type NotificationRow = typeof notifications.$inferSelect
export type NewNotificationRow = typeof notifications.$inferInsert

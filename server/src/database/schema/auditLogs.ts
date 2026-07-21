import { bigint, index, jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * A single administrator (or security-relevant) action
 * (docs/BUSINESS_RULES.md: Audit Rules). Read-only after insert: no
 * update/delete repository functions exist for this table by design.
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    // Dotted action name, e.g. 'campaign.create', 'disbursement.approve', 'login.failed'.
    action: varchar('action', { length: 80 }).notNull(),
    entityType: varchar('entity_type', { length: 40 }),
    entityId: bigint('entity_id', { mode: 'number' }),
    details: jsonb('details'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_logs_user_idx').on(table.userId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_created_idx').on(table.createdAt),
  ],
)

export type AuditLogRow = typeof auditLogs.$inferSelect
export type NewAuditLogRow = typeof auditLogs.$inferInsert

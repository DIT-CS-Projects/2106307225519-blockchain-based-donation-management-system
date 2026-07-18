import { bigint, boolean, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * Active refresh-token sessions. One row per device/login.
 * Only a hash of the refresh token is stored, so a database read never yields
 * a usable token. Revoking a row (or all rows for a user) powers logout and
 * logout-from-all-devices (docs/SECURITY.md).
 */
export const sessions = pgTable(
  'sessions',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    // SHA-256 hex of the refresh token (64 chars).
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    userAgent: text('user_agent'),
    // Remember-me: persistent cookie vs session cookie. Preserved across rotation.
    persistent: boolean('persistent').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('sessions_token_hash_idx').on(table.tokenHash),
    index('sessions_user_id_idx').on(table.userId),
  ],
)

export type SessionRow = typeof sessions.$inferSelect
export type NewSessionRow = typeof sessions.$inferInsert

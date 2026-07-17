import { bigint, index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * Single-use password reset tokens (api/authentication.md, Forgot Password).
 * Only a hash of the token is stored; the raw token lives only in the emailed
 * reset link. Tokens expire after one hour and are invalidated once used.
 */
export const passwordResets = pgTable(
  'password_resets',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    // SHA-256 hex of the reset token (64 chars).
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('password_resets_token_hash_idx').on(table.tokenHash),
    index('password_resets_user_id_idx').on(table.userId),
  ],
)

export type PasswordResetRow = typeof passwordResets.$inferSelect
export type NewPasswordResetRow = typeof passwordResets.$inferInsert

import { and, eq, isNull } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { passwordResets, type PasswordResetRow } from '../database/schema'

export interface NewPasswordReset {
  userId: number
  tokenHash: string
  expiresAt: Date
}

export async function insertPasswordReset(data: NewPasswordReset): Promise<void> {
  const client = requireDb()
  await client.insert(passwordResets).values(data)
}

/** Find an unused reset token row by its hash. Expiry is checked by the caller. */
export async function findUnusedResetByTokenHash(
  tokenHash: string,
): Promise<PasswordResetRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, tokenHash), isNull(passwordResets.usedAt)))
    .limit(1)
  return row
}

export async function markResetUsed(id: number): Promise<void> {
  const client = requireDb()
  await client
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(eq(passwordResets.id, id))
}

/** Invalidate any outstanding reset tokens for a user (single active token). */
export async function invalidateUserResets(userId: number): Promise<void> {
  const client = requireDb()
  await client
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordResets.userId, userId), isNull(passwordResets.usedAt)))
}

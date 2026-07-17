import { and, eq, isNull } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { sessions, type SessionRow } from '../database/schema'

export interface NewSession {
  userId: number
  tokenHash: string
  userAgent: string | null
  expiresAt: Date
}

export async function insertSession(data: NewSession): Promise<SessionRow> {
  const client = requireDb()
  const [row] = await client.insert(sessions).values(data).returning()
  return row
}

/** Look up a live (not revoked) session by its refresh-token hash. */
export async function findLiveSessionByTokenHash(
  tokenHash: string,
): Promise<SessionRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
    .limit(1)
  return row
}

export async function revokeSession(id: number): Promise<void> {
  const client = requireDb()
  await client
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)))
}

/** Revoke every live session for a user: powers logout from all devices. */
export async function revokeAllSessionsForUser(userId: number): Promise<void> {
  const client = requireDb()
  await client
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
}

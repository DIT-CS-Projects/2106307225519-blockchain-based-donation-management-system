import { REFRESH_TOKEN_TTL_SECONDS } from '../constants/auth'
import type { UserRow } from '../database/schema'
import {
  findLiveSessionByTokenHash,
  insertSession,
  revokeAllSessionsForUser,
  revokeSession,
} from '../repositories/session.repository'
import { findUserById } from '../repositories/user.repository'
import { signAccessToken } from '../utils/jwt'
import { generateToken, hashToken } from '../utils/tokens'
import { ApiError } from '../utils/ApiError'

/** Tokens handed back to the client: access token in the body, refresh in a cookie. */
export interface IssuedTokens {
  accessToken: string
  refreshToken: string
  refreshExpiresAt: Date
  /** Remember-me: whether the refresh cookie should outlive the browser session. */
  persistent: boolean
}

const MS_PER_SECOND = 1000

/** Create a new session row and mint a fresh access + refresh token pair. */
async function createSession(
  user: Pick<UserRow, 'id' | 'role'>,
  userAgent: string | null,
  persistent: boolean,
): Promise<IssuedTokens> {
  const refreshToken = generateToken()
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * MS_PER_SECOND)

  await insertSession({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent,
    persistent,
    expiresAt: refreshExpiresAt,
  })

  const accessToken = signAccessToken({ sub: user.id, role: user.role })
  return { accessToken, refreshToken, refreshExpiresAt, persistent }
}

/** Issue a brand-new session (login / register). */
export function issueSession(
  user: Pick<UserRow, 'id' | 'role'>,
  userAgent: string | null,
  persistent: boolean,
): Promise<IssuedTokens> {
  return createSession(user, userAgent, persistent)
}

export interface RotatedSession extends IssuedTokens {
  user: UserRow
}

/**
 * Rotate a refresh token: revoke the presented session and issue a new one.
 * Rejects unknown, revoked, or expired tokens (docs/SECURITY.md, rotation).
 */
export async function rotateSession(
  rawRefreshToken: string,
  userAgent: string | null,
): Promise<RotatedSession> {
  const session = await findLiveSessionByTokenHash(hashToken(rawRefreshToken))
  if (!session) {
    throw ApiError.unauthorized('Session expired. Please sign in again.')
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await revokeSession(session.id)
    throw ApiError.unauthorized('Session expired. Please sign in again.')
  }

  const user = await findUserById(session.userId)
  if (!user) {
    await revokeSession(session.id)
    throw ApiError.unauthorized('Session expired. Please sign in again.')
  }

  await revokeSession(session.id)
  // Preserve the original remember-me preference across rotation.
  const tokens = await createSession(user, userAgent, session.persistent)
  return { ...tokens, user }
}

/** Revoke the single session behind a refresh token (logout). Silent if unknown. */
export async function revokeSessionByToken(rawRefreshToken: string): Promise<void> {
  const session = await findLiveSessionByTokenHash(hashToken(rawRefreshToken))
  if (session) {
    await revokeSession(session.id)
  }
}

/** Revoke every session for a user (logout from all devices). */
export function revokeAllSessions(userId: number): Promise<void> {
  return revokeAllSessionsForUser(userId)
}

import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { ACCESS_TOKEN_TTL_SECONDS } from '../constants/auth'
import { userRole, type UserRow } from '../database/schema'

export interface AccessTokenPayload {
  sub: number
  role: UserRow['role']
}

// Kept in sync with the user_role enum (Decision 020: donor, fundraiser, admin).
const VALID_ROLES = new Set<string>(userRole.enumValues)

/**
 * Sign a short-lived access token. The client sends this as a Bearer token;
 * the refresh token (opaque, in an httpOnly cookie) is handled separately.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  })
}

/** Verify and decode an access token. Throws if invalid or expired. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.sub !== 'number' ||
    typeof decoded.role !== 'string' ||
    !VALID_ROLES.has(decoded.role)
  ) {
    throw new Error('Malformed access token')
  }
  return { sub: decoded.sub, role: decoded.role as UserRow['role'] }
}

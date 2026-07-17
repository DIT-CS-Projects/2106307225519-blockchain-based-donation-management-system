import { createHash, randomBytes } from 'node:crypto'

const TOKEN_BYTES = 32

/**
 * Generate a cryptographically random, URL-safe opaque token.
 * Used for refresh tokens and password reset tokens. Only the hash of the
 * token is ever persisted; the raw value is returned to the caller once.
 */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

/** SHA-256 hex digest of a token, for storage and constant-work lookup. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

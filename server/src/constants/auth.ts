// Authentication tuning constants. Source of truth: docs/SECURITY.md.
// Kept here so no auth magic numbers leak into services or middleware.

/** Cost factor for bcrypt hashing. Higher is slower and more resistant. */
export const BCRYPT_ROUNDS = 12

const SECONDS = 1
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES
const DAYS = 24 * HOURS

/** Short-lived access token: sent as a Bearer token by the client. */
export const ACCESS_TOKEN_TTL_SECONDS = 30 * MINUTES

/** Long-lived refresh token: stored in an httpOnly cookie, rotated on use. */
export const REFRESH_TOKEN_TTL_SECONDS = 7 * DAYS

/** Single-use password reset token lifetime (api/authentication.md). */
export const PASSWORD_RESET_TTL_SECONDS = 1 * HOURS

// Account lockout after repeated failed logins (docs/SECURITY.md).
export const MAX_FAILED_LOGIN_ATTEMPTS = 5
export const ACCOUNT_LOCKOUT_SECONDS = 15 * MINUTES

/** Name of the httpOnly cookie carrying the refresh token. */
export const REFRESH_COOKIE_NAME = 'changia_refresh'

/** The refresh cookie is only ever sent to the auth routes that consume it. */
export const REFRESH_COOKIE_PATH = '/api/auth'

/**
 * Password policy (docs/SECURITY.md): min 8 chars with an uppercase letter,
 * a lowercase letter, a number, and a special character.
 */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
} as const

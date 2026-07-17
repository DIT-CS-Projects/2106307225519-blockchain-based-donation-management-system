import bcrypt from 'bcryptjs'
import { z } from 'zod'
import {
  BCRYPT_ROUNDS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERNS,
} from '../constants/auth'

/** Hash a plain-text password with bcrypt. Plain text is never stored. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

/** Verify a plain-text password against a stored bcrypt hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * Reusable zod schema enforcing the password policy (docs/SECURITY.md).
 * Used by register, change-password, and reset-password validation.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(PASSWORD_PATTERNS.uppercase, 'Password must include an uppercase letter')
  .regex(PASSWORD_PATTERNS.lowercase, 'Password must include a lowercase letter')
  .regex(PASSWORD_PATTERNS.number, 'Password must include a number')
  .regex(PASSWORD_PATTERNS.special, 'Password must include a special character')

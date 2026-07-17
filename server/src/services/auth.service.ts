import {
  ACCOUNT_LOCKOUT_SECONDS,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from '../constants/auth'
import {
  emailExists,
  findUserByEmail,
  insertUser,
  phoneExists,
  updateLoginState,
} from '../repositories/user.repository'
import { hashPassword, verifyPassword } from '../utils/password'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import type { LoginInput, RegisterInput } from '../validation/auth'
import {
  issueSession,
  rotateSession,
  revokeSessionByToken,
  type IssuedTokens,
} from './session.service'
import { toUserDto, type UserDto } from './user.dto'

const MS_PER_SECOND = 1000

export interface AuthResult {
  user: UserDto
  tokens: IssuedTokens
}

/** Register a new donor, then sign them in (api/authentication.md, Register). */
export async function register(
  input: RegisterInput,
  userAgent: string | null,
): Promise<AuthResult> {
  if (await emailExists(input.email)) {
    throw ApiError.conflict('An account with this email already exists')
  }
  if (await phoneExists(input.phone)) {
    throw ApiError.conflict('An account with this phone number already exists')
  }

  const passwordHash = await hashPassword(input.password)
  const user = await insertUser({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: 'donor',
  })

  const tokens = await issueSession(user, userAgent)
  logger.info(`New donor registered: user ${user.id}`)
  return { user: toUserDto(user), tokens }
}

/** Authenticate a user, tracking failed attempts and enforcing lockout. */
export async function login(
  input: LoginInput,
  userAgent: string | null,
): Promise<AuthResult> {
  const user = await findUserByEmail(input.email)
  if (!user) {
    // Same generic failure whether or not the email exists.
    throw ApiError.unauthorized('Incorrect email or password')
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    logger.warn(`Login blocked for locked account: user ${user.id}`)
    throw new ApiError(423, 'Account locked due to too many attempts. Try again later.')
  }

  const passwordOk = await verifyPassword(input.password, user.passwordHash)
  if (!passwordOk) {
    await registerFailedAttempt(user.id, user.failedLoginAttempts)
    logger.warn(`Failed login attempt: user ${user.id}`)
    throw ApiError.unauthorized('Incorrect email or password')
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await updateLoginState(user.id, 0, null)
  }

  const tokens = await issueSession(user, userAgent)
  logger.info(`Login successful: user ${user.id}`)
  return { user: toUserDto(user), tokens }
}

/** Advance the failed-attempt counter and lock the account at the threshold. */
async function registerFailedAttempt(userId: number, current: number): Promise<void> {
  const attempts = current + 1
  const lockedUntil =
    attempts >= MAX_FAILED_LOGIN_ATTEMPTS
      ? new Date(Date.now() + ACCOUNT_LOCKOUT_SECONDS * MS_PER_SECOND)
      : null
  await updateLoginState(userId, attempts, lockedUntil)
}

/** Exchange a refresh token for a rotated pair (docs/SECURITY.md, rotation). */
export async function refresh(
  rawRefreshToken: string,
  userAgent: string | null,
): Promise<AuthResult> {
  const rotated = await rotateSession(rawRefreshToken, userAgent)
  const { user, ...tokens } = rotated
  return { user: toUserDto(user), tokens }
}

/** Revoke the current session. Always succeeds, even with no/unknown token. */
export async function logout(rawRefreshToken: string | undefined): Promise<void> {
  if (rawRefreshToken) {
    await revokeSessionByToken(rawRefreshToken)
  }
}

import { env } from '../config/env'
import { PASSWORD_RESET_TTL_SECONDS } from '../constants/auth'
import {
  invalidateUserResets,
  findUnusedResetByTokenHash,
  insertPasswordReset,
  markResetUsed,
} from '../repositories/passwordReset.repository'
import {
  findUserByEmail,
  findUserById,
  updateUserPassword,
  updateUserProfile,
} from '../repositories/user.repository'
import { hashPassword, verifyPassword } from '../utils/password'
import { generateToken, hashToken } from '../utils/tokens'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '../validation/auth'
import { revokeAllSessions } from './session.service'
import { toUserDto, type UserDto } from './user.dto'
import { notify } from './notification.service'
import { getEmailProvider } from './email'

const MS_PER_SECOND = 1000

/** Current authenticated user (api/authentication.md, GET /me). */
export async function getMe(userId: number): Promise<UserDto> {
  const user = await findUserById(userId)
  if (!user) {
    throw ApiError.notFound('User not found')
  }
  return toUserDto(user)
}

/** Update the caller's own profile (full name, phone, profile photo). */
export async function updateProfile(
  userId: number,
  input: UpdateProfileInput,
): Promise<UserDto> {
  const user = await findUserById(userId)
  if (!user) {
    throw ApiError.notFound('User not found')
  }

  const updated = await updateUserProfile(userId, {
    fullName: input.fullName,
    phone: input.phone,
    profilePhotoUrl: input.profilePhotoUrl,
  })
  return toUserDto(updated)
}

/**
 * Change the caller's password after verifying the current one, then revoke
 * every session so all devices must sign in again (docs/SECURITY.md).
 */
export async function changePassword(
  userId: number,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await findUserById(userId)
  if (!user) {
    throw ApiError.notFound('User not found')
  }

  const currentOk = await verifyPassword(input.oldPassword, user.passwordHash)
  if (!currentOk) {
    throw ApiError.badRequest('Your current password is incorrect')
  }

  await updateUserPassword(userId, await hashPassword(input.newPassword))
  await revokeAllSessions(userId)
  logger.info(`Password changed: user ${userId}`)
  void notify({
    userIds: [userId],
    type: 'password_changed',
    title: 'Your password was changed',
    message: 'If this was not you, contact support immediately.',
  })
}

/**
 * Begin a password reset. Always resolves without revealing whether the email
 * exists (api/authentication.md, Forgot Password). A single-use token is stored
 * hashed; the raw token travels only in the emailed reset link.
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const user = await findUserByEmail(input.email)
  if (!user) {
    return
  }

  // One active token per user: retire any earlier ones first.
  await invalidateUserResets(user.id)

  const rawToken = generateToken()
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * MS_PER_SECOND)
  await insertPasswordReset({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt,
  })

  const resetLink = `${env.CLIENT_ORIGIN}/reset-password?token=${rawToken}`
  logger.info(`Password reset requested for user ${user.id}.`)
  await getEmailProvider().send({
    to: user.email,
    subject: 'Reset your ChangiaTanzania password',
    text: `Use this link to reset your password (valid for a limited time): ${resetLink}`,
  })
}

/**
 * Complete a password reset with a valid, unexpired, single-use token, then
 * revoke every session for the account (api/authentication.md, Reset Password).
 */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const reset = await findUnusedResetByTokenHash(hashToken(input.token))
  if (!reset || reset.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('This reset link is invalid or has expired')
  }

  await updateUserPassword(reset.userId, await hashPassword(input.newPassword))
  await markResetUsed(reset.id)
  await revokeAllSessions(reset.userId)
  logger.info(`Password reset completed: user ${reset.userId}`)
}

/** Log out from all devices by revoking every session for the caller. */
export function logoutAllDevices(userId: number): Promise<void> {
  logger.info(`Logout from all devices: user ${userId}`)
  return revokeAllSessions(userId)
}

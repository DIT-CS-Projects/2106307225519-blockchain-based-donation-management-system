import type { NextFunction, Request, Response } from 'express'
import * as accountService from '../services/account.service'
import { clearRefreshCookie } from '../utils/authCookies'
import { ApiError } from '../utils/ApiError'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validation/auth'

// requireAuth guarantees req.user on the routes below.
function requireUserId(req: Request): number {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required')
  }
  return req.user.id
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await accountService.getMe(requireUserId(req))
    res.json({ user })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = updateProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid profile details')
    }
    const user = await accountService.updateProfile(requireUserId(req), parsed.data)
    res.json({ user })
  } catch (error) {
    next(error)
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = changePasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid password details')
    }
    await accountService.changePassword(requireUserId(req), parsed.data)
    // Every session was revoked; drop this device's refresh cookie too.
    clearRefreshCookie(res)
    res.json({ message: 'Password changed. Please sign in again.' })
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body)
    if (parsed.success) {
      await accountService.forgotPassword(parsed.data)
    }
    // Always 200, regardless of validity or whether the email exists.
    res.json({
      message: 'If an account exists for that email, a reset link is on its way.',
    })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid reset details')
    }
    await accountService.resetPassword(parsed.data)
    res.json({ message: 'Your password has been reset. Please sign in.' })
  } catch (error) {
    next(error)
  }
}

export async function logoutAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await accountService.logoutAllDevices(requireUserId(req))
    clearRefreshCookie(res)
    res.json({ message: 'Signed out of all devices' })
  } catch (error) {
    next(error)
  }
}

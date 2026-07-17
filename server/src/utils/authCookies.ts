import type { Response } from 'express'
import { env } from '../config/env'
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../constants/auth'

const baseOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  path: REFRESH_COOKIE_PATH,
}

/** Store the refresh token in an httpOnly cookie scoped to the auth routes. */
export function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...baseOptions, expires: expiresAt })
}

/** Remove the refresh cookie (logout, all-devices logout, password change). */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions)
}

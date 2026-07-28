import type { Response } from 'express'
import { env } from '../config/env'
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../constants/auth'

// In production the SPA (Vercel) and API (Render) live on different origins, so
// the refresh cookie is sent cross-site. SameSite=Lax would drop it on those
// requests and silently break token rotation; SameSite=None keeps it flowing,
// and it requires Secure (always true over HTTPS in production). Locally we
// stay on Lax so the cookie works over plain http on localhost.
const isProduction = env.NODE_ENV === 'production'

const baseOptions = {
  httpOnly: true,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProduction,
  path: REFRESH_COOKIE_PATH,
}

/**
 * Store the refresh token in an httpOnly cookie scoped to the auth routes.
 * When persistent is false (remember-me off) it is a session cookie that the
 * browser drops on close; otherwise it lasts until the token expires.
 */
export function setRefreshCookie(
  res: Response,
  token: string,
  expiresAt: Date,
  persistent: boolean,
): void {
  const options = persistent ? { ...baseOptions, expires: expiresAt } : baseOptions
  res.cookie(REFRESH_COOKIE_NAME, token, options)
}

/** Remove the refresh cookie (logout, all-devices logout, password change). */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions)
}

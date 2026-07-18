import type { NextFunction, Request, Response } from 'express'
import { REFRESH_COOKIE_NAME } from '../constants/auth'
import * as authService from '../services/auth.service'
import type { AuthResult } from '../services/auth.service'
import { clearRefreshCookie, setRefreshCookie } from '../utils/authCookies'
import { ApiError } from '../utils/ApiError'
import { loginSchema, registerSchema } from '../validation/auth'

function userAgentOf(req: Request): string | null {
  return req.headers['user-agent'] ?? null
}

/** Set the refresh cookie and shape the JSON body ({ token, user }). */
function sendAuthResult(res: Response, status: number, result: AuthResult): void {
  setRefreshCookie(
    res,
    result.tokens.refreshToken,
    result.tokens.refreshExpiresAt,
    result.tokens.persistent,
  )
  res.status(status).json({
    token: result.tokens.accessToken,
    user: result.user,
  })
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid registration details')
    }
    const result = await authService.register(parsed.data, userAgentOf(req))
    setRefreshCookie(
      res,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresAt,
      result.tokens.persistent,
    )
    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      token: result.tokens.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest('Enter your email and password')
    }
    const result = await authService.login(parsed.data, userAgentOf(req))
    sendAuthResult(res, 200, result)
  } catch (error) {
    next(error)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    if (!token) {
      throw ApiError.unauthorized('Session expired. Please sign in again.')
    }
    const result = await authService.refresh(token, userAgentOf(req))
    sendAuthResult(res, 200, result)
  } catch (error) {
    next(error)
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    await authService.logout(token)
    clearRefreshCookie(res)
    res.status(200).json({ message: 'Logged out' })
  } catch (error) {
    next(error)
  }
}

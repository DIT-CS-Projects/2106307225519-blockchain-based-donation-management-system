import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { ApiError } from '../utils/ApiError'
import type { UserRow } from '../database/schema'

const BEARER_PREFIX = 'Bearer '

/**
 * Require a valid access token. On success attaches req.user; otherwise passes
 * a 401 to the error handler. Protected routes: docs/SECURITY.md.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(ApiError.unauthorized('Authentication required'))
    return
  }

  try {
    const payload = verifyAccessToken(header.slice(BEARER_PREFIX.length))
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(ApiError.unauthorized('Your session has expired. Please sign in again.'))
  }
}

/**
 * Require the authenticated user to hold one of the given roles (RBAC).
 * Must run after requireAuth.
 */
export function requireRole(...roles: UserRow['role'][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'))
      return
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have permission to perform this action'))
      return
    }
    next()
  }
}

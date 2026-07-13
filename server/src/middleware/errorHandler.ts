import type { ErrorRequestHandler } from 'express'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import { env } from '../config/env'

/** Central error handler. Never leaks stack traces to clients. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError
  const statusCode = isApiError ? err.statusCode : 500
  const message = isApiError ? err.message : 'Internal server error'

  if (statusCode >= 500) {
    logger.error(err)
  }

  const body: Record<string, unknown> = { message }
  if (env.NODE_ENV === 'development' && !isApiError) {
    body.detail = err instanceof Error ? err.message : String(err)
  }

  res.status(statusCode).json(body)
}

import type { ErrorRequestHandler } from 'express'
import { MulterError } from 'multer'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import { env } from '../config/env'

const MULTER_MESSAGES: Partial<Record<MulterError['code'], string>> = {
  LIMIT_FILE_SIZE: 'That image is too large. Maximum size is 5 MB.',
  LIMIT_UNEXPECTED_FILE: 'Unexpected upload field.',
}

/** Central error handler. Never leaks stack traces to clients. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError
  const isMulterError = err instanceof MulterError
  const statusCode = isApiError ? err.statusCode : isMulterError ? 400 : 500
  const message = isApiError
    ? err.message
    : isMulterError
      ? (MULTER_MESSAGES[err.code] ?? 'Upload failed. Please try again.')
      : 'Internal server error'

  if (statusCode >= 500) {
    logger.error(err)
  }

  const body: Record<string, unknown> = { message }
  if (env.NODE_ENV === 'development' && !isApiError) {
    body.detail = err instanceof Error ? err.message : String(err)
  }

  res.status(statusCode).json(body)
}

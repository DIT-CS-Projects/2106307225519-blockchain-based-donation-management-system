import type { NextFunction, Request, Response } from 'express'
import { contactMessageSchema, submitContactMessage } from '../services/contact.service'
import { ApiError } from '../utils/ApiError'

export async function postContactMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = contactMessageSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest('Please check the form and try again.')
    }
    await submitContactMessage(parsed.data)
    res.status(202).json({ ok: true })
  } catch (error) {
    next(error)
  }
}

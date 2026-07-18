import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import * as paymentService from '../services/payment.service'
import { createSessionSchema } from '../validation/payment'
import { ApiError } from '../utils/ApiError'

function requireUserId(req: Request): number {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required')
  }
  return req.user.id
}

const referenceParamSchema = z.string().trim().min(1).max(64)

export async function createSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createSessionSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid donation request')
    }
    const result = await paymentService.createSession(requireUserId(req), parsed.data)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function callback(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await paymentService.handleCallback(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function status(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reference = referenceParamSchema.safeParse(req.params.reference)
    if (!reference.success) {
      throw ApiError.notFound('Payment not found')
    }
    const result = await paymentService.getPaymentStatus(requireUserId(req), reference.data)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

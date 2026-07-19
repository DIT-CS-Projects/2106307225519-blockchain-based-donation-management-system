import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { getPublicVerification } from '../services/donation.service'
import { ApiError } from '../utils/ApiError'

const receiptNumberSchema = z.string().trim().min(1).max(32)

export async function verifyReceipt(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const receiptNumber = receiptNumberSchema.safeParse(req.params.receiptNumber)
    if (!receiptNumber.success) {
      throw ApiError.notFound('No verified record found for this receipt')
    }
    res.json(await getPublicVerification(receiptNumber.data))
  } catch (error) {
    next(error)
  }
}

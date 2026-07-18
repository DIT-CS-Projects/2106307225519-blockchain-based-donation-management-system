import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import * as donationService from '../services/donation.service'
import { renderReceiptPdf } from '../services/receipt.service'
import { ApiError } from '../utils/ApiError'

function requireUserId(req: Request): number {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required')
  }
  return req.user.id
}

const idParamSchema = z.coerce.number().int().positive()

function parseId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) {
    throw ApiError.notFound('Donation not found')
  }
  return id.data
}

export async function history(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await donationService.getHistory(requireUserId(req))
    res.json({ items })
  } catch (error) {
    next(error)
  }
}

export async function summary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await donationService.getSummary(requireUserId(req)))
  } catch (error) {
    next(error)
  }
}

export async function statistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await donationService.getStatistics())
  } catch (error) {
    next(error)
  }
}

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const donation = await donationService.getDonation(requireUserId(req), parseId(req))
    res.json({ donation })
  } catch (error) {
    next(error)
  }
}

export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await donationService.verifyDonation(requireUserId(req), parseId(req)))
  } catch (error) {
    next(error)
  }
}

export async function receipt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await donationService.getReceiptData(requireUserId(req), parseId(req))
    const pdf = await renderReceiptPdf(data)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receipt-${data.receiptNumber}.pdf"`,
    )
    res.send(pdf)
  } catch (error) {
    next(error)
  }
}

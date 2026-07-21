import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import * as disbursementService from '../services/disbursement.service'
import { ApiError } from '../utils/ApiError'
import {
  initiateDisbursementSchema,
  rejectDisbursementSchema,
} from '../validation/disbursement'

function requireAdminId(req: Request): number {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return req.user.id
}

const idParamSchema = z.coerce.number().int().positive()

function parseId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('Disbursement not found')
  return id.data
}

const listQuerySchema = z.object({
  status: z
    .enum(['pending_approval', 'approved', 'processing', 'completed', 'failed', 'rejected'])
    .optional(),
  campaignId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await disbursementService.listDisbursements(query.data))
  } catch (error) {
    next(error)
  }
}

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ disbursement: await disbursementService.getDisbursementDetail(parseId(req)) })
  } catch (error) {
    next(error)
  }
}

export async function initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = initiateDisbursementSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid disbursement request')
    }
    const disbursement = await disbursementService.initiateDisbursement(
      requireAdminId(req),
      parsed.data,
    )
    res.status(201).json({ disbursement })
  } catch (error) {
    next(error)
  }
}

export async function approve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const disbursement = await disbursementService.approveDisbursement(
      requireAdminId(req),
      parseId(req),
    )
    res.json({ disbursement })
  } catch (error) {
    next(error)
  }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = rejectDisbursementSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'A reason is required')
    }
    const disbursement = await disbursementService.rejectDisbursement(
      requireAdminId(req),
      parseId(req),
      parsed.data.reason,
    )
    res.json({ disbursement })
  } catch (error) {
    next(error)
  }
}

const campaignIdParamSchema = z.coerce.number().int().positive()

export async function balance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaignId = campaignIdParamSchema.safeParse(req.params.campaignId)
    if (!campaignId.success) throw ApiError.notFound('Campaign not found')
    res.json(await disbursementService.getAvailableBalance(campaignId.data))
  } catch (error) {
    next(error)
  }
}

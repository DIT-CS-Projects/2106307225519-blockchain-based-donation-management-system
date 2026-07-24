import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import * as beneficiaryService from '../services/beneficiary.service'
import { ApiError } from '../utils/ApiError'
import { uploadedFileUrl } from '../middleware/upload'
import { createBeneficiarySchema, updateBeneficiarySchema } from '../validation/beneficiary'

function requireAdminId(req: Request): number {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return req.user.id
}

function requireActor(req: Request): { id: number; role: 'donor' | 'fundraiser' | 'admin' } {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return { id: req.user.id, role: req.user.role }
}

const idParamSchema = z.coerce.number().int().positive()

function parseId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('Beneficiary not found')
  return id.data
}

const publicListQuerySchema = z.object({
  campaignId: z.coerce.number().int().positive().optional(),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = publicListQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json({ items: await beneficiaryService.listPublicBeneficiaries(query.data) })
  } catch (error) {
    next(error)
  }
}

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ beneficiary: await beneficiaryService.getPublicBeneficiary(parseId(req)) })
  } catch (error) {
    next(error)
  }
}

// --- Admin ---

const adminListQuerySchema = z.object({
  campaignId: z.coerce.number().int().positive().optional(),
  verified: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = adminListQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await beneficiaryService.listBeneficiariesAdmin(query.data))
  } catch (error) {
    next(error)
  }
}

export async function detailAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ beneficiary: await beneficiaryService.getBeneficiaryAdmin(parseId(req)) })
  } catch (error) {
    next(error)
  }
}

// --- Owner surface (fundraiser or admin) ---

const managedListQuerySchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  verified: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
})

export async function listManaged(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = managedListQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('A campaignId is required')
    const { campaignId, ...filters } = query.data
    res.json(await beneficiaryService.listManagedBeneficiaries(requireActor(req), campaignId, filters))
  } catch (error) {
    next(error)
  }
}

export async function detailManaged(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({
      beneficiary: await beneficiaryService.getManagedBeneficiary(requireActor(req), parseId(req)),
    })
  } catch (error) {
    next(error)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createBeneficiarySchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid beneficiary details')
    }
    const beneficiary = await beneficiaryService.createBeneficiary(requireActor(req), parsed.data)
    res.status(201).json({ beneficiary })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateBeneficiarySchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid beneficiary details')
    }
    const beneficiary = await beneficiaryService.updateBeneficiary(
      requireActor(req),
      parseId(req),
      parsed.data,
    )
    res.json({ beneficiary })
  } catch (error) {
    next(error)
  }
}

const verifySchema = z.object({ verified: z.boolean() })

export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = verifySchema.safeParse(req.body)
    if (!parsed.success) throw ApiError.badRequest('Invalid verification request')
    const beneficiary = await beneficiaryService.setVerification(
      requireAdminId(req),
      parseId(req),
      parsed.data.verified,
    )
    res.json({ beneficiary })
  } catch (error) {
    next(error)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await beneficiaryService.deleteBeneficiary(requireActor(req), parseId(req))
    res.json({ message: 'Beneficiary deleted' })
  } catch (error) {
    next(error)
  }
}

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw ApiError.badRequest('No image file provided')
    res.status(201).json({ url: uploadedFileUrl('beneficiaries', req.file.filename) })
  } catch (error) {
    next(error)
  }
}

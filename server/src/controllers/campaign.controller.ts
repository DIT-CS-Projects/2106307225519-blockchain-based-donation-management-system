import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import {
  archiveCampaign,
  createCampaign,
  deleteCampaign,
  getCampaignAdmin,
  getCampaignDetails,
  listCampaigns,
  listCampaignsAdmin,
  updateCampaign,
} from '../services/campaign.service'
import { ApiError } from '../utils/ApiError'
import { uploadedFileUrl } from '../middleware/upload'
import { createCampaignSchema, updateCampaignSchema } from '../validation/campaign'

const CATEGORIES = [
  'Education',
  'Health',
  'Disaster Relief',
  'Environment',
  'Community',
  'Other',
] as const

const listQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.enum(CATEGORIES).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sort: z.enum(['newest', 'endingSoon', 'mostFunded', 'alphabetical']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
})

const idParamSchema = z.coerce.number().int().positive()

export async function getCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      throw ApiError.badRequest('Invalid campaign filters')
    }
    res.json(await listCampaigns(query.data))
  } catch (error) {
    next(error)
  }
}

export async function getCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = idParamSchema.safeParse(req.params.id)
    if (!id.success) {
      throw ApiError.notFound('Campaign not found')
    }
    res.json(await getCampaignDetails(id.data))
  } catch (error) {
    next(error)
  }
}

// --- Admin ---

function requireAdminId(req: Request): number {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return req.user.id
}

function parseCampaignId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('Campaign not found')
  return id.data
}

const adminListQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function getCampaignsAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = adminListQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await listCampaignsAdmin(query.data))
  } catch (error) {
    next(error)
  }
}

export async function getCampaignAdminDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ campaign: await getCampaignAdmin(parseCampaignId(req)) })
  } catch (error) {
    next(error)
  }
}

export async function postCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createCampaignSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid campaign details')
    }
    const campaign = await createCampaign(requireAdminId(req), parsed.data)
    res.status(201).json({ campaign })
  } catch (error) {
    next(error)
  }
}

export async function putCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = updateCampaignSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid campaign details')
    }
    const campaign = await updateCampaign(requireAdminId(req), parseCampaignId(req), parsed.data)
    res.json({ campaign })
  } catch (error) {
    next(error)
  }
}

export async function patchArchiveCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await archiveCampaign(requireAdminId(req), parseCampaignId(req))
    res.json({ campaign })
  } catch (error) {
    next(error)
  }
}

export async function deleteCampaignHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteCampaign(requireAdminId(req), parseCampaignId(req))
    res.json({ message: 'Campaign deleted' })
  } catch (error) {
    next(error)
  }
}

export async function uploadCampaignImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) throw ApiError.badRequest('No image file provided')
    res.status(201).json({ url: uploadedFileUrl('campaigns', req.file.filename) })
  } catch (error) {
    next(error)
  }
}

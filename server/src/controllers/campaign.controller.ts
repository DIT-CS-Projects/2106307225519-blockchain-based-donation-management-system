import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import {
  approveCampaign,
  archiveCampaign,
  createCampaign,
  deleteCampaign,
  getCampaignAdmin,
  getCampaignDetails,
  getManagedCampaign,
  listCampaigns,
  listCampaignsAdmin,
  listMyCampaigns,
  rejectCampaign,
  submitCampaign,
  updateCampaign,
  type Actor,
} from '../services/campaign.service'
import { ApiError } from '../utils/ApiError'
import { uploadedFileUrl } from '../middleware/upload'
import { createCampaignSchema, updateCampaignSchema } from '../validation/campaign'
import { rejectReasonSchema } from '../validation/fundraiser'

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

// --- Management (admin + owning fundraiser) ---

function requireActor(req: Request): Actor {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return { id: req.user.id, role: req.user.role }
}

function parseCampaignId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('Campaign not found')
  return id.data
}

const adminListQuerySchema = z.object({
  status: z
    .enum(['draft', 'pending_review', 'active', 'rejected', 'completed', 'archived'])
    .optional(),
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

/** Campaigns owned by the acting fundraiser/administrator (their dashboard). */
export async function getMyCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = adminListQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await listMyCampaigns(requireActor(req).id, query.data))
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

/** Owner-or-admin campaign detail for the management surface. */
export async function getManagedCampaignDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ campaign: await getManagedCampaign(requireActor(req), parseCampaignId(req)) })
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
    const campaign = await createCampaign(requireActor(req), parsed.data)
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
    const campaign = await updateCampaign(requireActor(req), parseCampaignId(req), parsed.data)
    res.json({ campaign })
  } catch (error) {
    next(error)
  }
}

export async function postSubmitCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await submitCampaign(requireActor(req), parseCampaignId(req))
    res.json({ campaign })
  } catch (error) {
    next(error)
  }
}

export async function postApproveCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await approveCampaign(requireActor(req).id, parseCampaignId(req))
    res.json({ campaign })
  } catch (error) {
    next(error)
  }
}

export async function postRejectCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = rejectReasonSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'A reason is required')
    }
    const campaign = await rejectCampaign(requireActor(req).id, parseCampaignId(req), parsed.data.reason)
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
    const campaign = await archiveCampaign(requireActor(req), parseCampaignId(req))
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
    await deleteCampaign(requireActor(req), parseCampaignId(req))
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

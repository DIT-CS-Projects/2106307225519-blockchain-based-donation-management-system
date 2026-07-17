import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { getCampaignDetails, listCampaigns } from '../services/campaign.service'
import { ApiError } from '../utils/ApiError'

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

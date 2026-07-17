import {
  findCampaignById,
  findCampaigns,
  findRelatedCampaigns,
  type CampaignListFilters,
} from '../repositories/campaign.repository'
import type { CampaignRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'

const RELATED_LIMIT = 3

/** Public shape of a campaign: what the client receives. */
export interface CampaignDto {
  id: number
  title: string
  description: string
  category: CampaignRow['category']
  imageUrl: string | null
  targetAmount: number
  raisedAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed'
  featured: boolean
}

export interface CampaignListResult {
  items: CampaignDto[]
  total: number
  page: number
  limit: number
}

/**
 * Business rule: a campaign automatically becomes Completed after its end
 * date. Derived on read until a scheduled job owns the transition.
 */
function toDto(row: CampaignRow): CampaignDto {
  const ended = row.endDate.getTime() < Date.now()
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl,
    targetAmount: row.targetAmount,
    raisedAmount: row.raisedAmount,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    status: row.status === 'active' && ended ? 'completed' : (row.status as 'active' | 'completed'),
    featured: row.featured,
  }
}

export async function listCampaigns(filters: CampaignListFilters): Promise<CampaignListResult> {
  const { rows, total } = await findCampaigns(filters)
  return {
    items: rows.map(toDto),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}

export interface CampaignDetailsResult {
  campaign: CampaignDto
  relatedCampaigns: CampaignDto[]
}

export async function getCampaignDetails(id: number): Promise<CampaignDetailsResult> {
  const row = await findCampaignById(id)
  if (!row) {
    throw ApiError.notFound('Campaign not found')
  }
  const related = await findRelatedCampaigns(row.category, row.id, RELATED_LIMIT)
  return {
    campaign: toDto(row),
    relatedCampaigns: related.map(toDto),
  }
}

import { api } from '@/services/api'
import type { CampaignCategory } from '@/constants/config'

// Contract: api/campaigns.md (GET /api/campaigns, GET /api/campaigns/:id, public).
export interface Campaign {
  id: number
  title: string
  description: string
  category: CampaignCategory
  imageUrl: string | null
  targetAmount: number
  raisedAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed'
  featured: boolean
}

export type CampaignSort = 'newest' | 'endingSoon' | 'mostFunded' | 'alphabetical'

export interface CampaignListParams {
  search?: string
  category?: CampaignCategory
  featured?: boolean
  sort?: CampaignSort
  page?: number
  limit?: number
}

export interface CampaignListResult {
  items: Campaign[]
  total: number
  page: number
  limit: number
}

export interface CampaignDetails {
  campaign: Campaign
  relatedCampaigns: Campaign[]
}

const FEATURED_LIMIT = 6

export async function getCampaigns(params: CampaignListParams = {}): Promise<CampaignListResult> {
  const { data } = await api.get<CampaignListResult>('/campaigns', { params })
  return data
}

/** Featured campaigns for the landing page (max 6 per pages/landing-page.md). */
export async function getFeaturedCampaigns(): Promise<Campaign[]> {
  const result = await getCampaigns({ featured: true, limit: FEATURED_LIMIT })
  return result.items
}

export async function getCampaignDetails(id: string): Promise<CampaignDetails> {
  const { data } = await api.get<CampaignDetails>(`/campaigns/${id}`)
  return data
}

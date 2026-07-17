import { api } from '@/services/api'
import type { CampaignCategory } from '@/constants/config'

// Contract: api/campaigns.md — GET /api/campaigns (public).
export interface Campaign {
  id: string
  title: string
  description: string
  category: CampaignCategory
  imageUrl: string | null
  targetAmount: number
  raisedAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'archived'
}

const FEATURED_LIMIT = 6

/** Featured campaigns for the landing page (max 6 per pages/landing-page.md). */
export async function getFeaturedCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<Campaign[]>('/campaigns', {
    params: { featured: true, limit: FEATURED_LIMIT },
  })
  return data
}

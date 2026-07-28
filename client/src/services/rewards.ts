import { api } from '@/services/api'

// Contract: api/rewards.md (base path /api/rewards). Requires auth.

export type RewardEventType = 'donation' | 'first_donation' | 'new_campaign'

export interface RewardEvent {
  id: number
  type: RewardEventType
  points: number
  description: string
  donationId: number | null
  createdAt: string
}

export interface Tier {
  name: string
  min: number
}

export interface RewardsOverview {
  pointsLabel: string
  balance: number
  tier: Tier
  nextTier: { name: string; pointsNeeded: number } | null
  tiers: Tier[]
  rules: {
    basePer1000: number
    minPerDonation: number
    firstDonation: number
    newCampaign: number
  }
  events: RewardEvent[]
}

export async function getRewards(): Promise<RewardsOverview> {
  const { data } = await api.get<RewardsOverview>('/rewards')
  return data
}

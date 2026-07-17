import { api } from '@/services/api'

// Contract: pages/landing-page.md — GET /api/stats (public platform totals).
export interface PlatformStats {
  totalDonationsTZS: number
  totalCampaigns: number
  peopleHelped: number
  verifiedDonations: number
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data } = await api.get<PlatformStats>('/stats')
  return data
}

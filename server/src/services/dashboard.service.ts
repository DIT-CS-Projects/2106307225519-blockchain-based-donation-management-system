import {
  countConfirmedBlockchainProofs,
  findRecentDonations,
  getAdminDonationStats,
  getPaymentMethodBreakdown,
  getPlatformMonthlyTotals,
} from '../repositories/donation.repository'
import { countCampaignsByStatus, findCampaignsAdmin } from '../repositories/campaign.repository'
import { countBeneficiaries } from '../repositories/beneficiary.repository'
import { countUsers } from '../repositories/user.repository'

const RECENT_DONATIONS_LIMIT = 10
const CAMPAIGN_OVERVIEW_LIMIT = 6
const MONTHS_OF_HISTORY = 6

export interface DashboardStats {
  totalDonations: number
  totalRevenue: number
  activeCampaigns: number
  beneficiaries: number
  registeredUsers: number
  blockchainTransactions: number
}

export interface DashboardResult {
  stats: DashboardStats
  recentDonations: {
    id: number
    donor: string
    campaign: string
    amount: number
    paymentStatus: string
    blockchainStatus: string
    createdAt: string
  }[]
  campaignOverview: {
    id: number
    title: string
    raisedAmount: number
    targetAmount: number
    status: string
    endDate: string
  }[]
  charts: {
    donationTrend: { month: string; total: number }[]
    paymentMethods: { method: string; total: number }[]
  }
}

/** Aggregated admin dashboard payload (pages/admin-dashboard.md). */
export async function getDashboard(): Promise<DashboardResult> {
  const since = new Date()
  since.setMonth(since.getMonth() - (MONTHS_OF_HISTORY - 1))
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const [
    donationStats,
    activeCampaigns,
    beneficiaryCount,
    userCount,
    blockchainCount,
    recentDonations,
    campaignOverview,
    donationTrend,
    paymentMethods,
  ] = await Promise.all([
    getAdminDonationStats(),
    countCampaignsByStatus('active'),
    countBeneficiaries(),
    countUsers(),
    countConfirmedBlockchainProofs(),
    findRecentDonations(RECENT_DONATIONS_LIMIT),
    findCampaignsAdmin({ status: 'active', page: 1, limit: CAMPAIGN_OVERVIEW_LIMIT }),
    getPlatformMonthlyTotals(since),
    getPaymentMethodBreakdown(),
  ])

  return {
    stats: {
      totalDonations: donationStats.totalCount,
      totalRevenue: donationStats.totalAmount,
      activeCampaigns,
      beneficiaries: beneficiaryCount,
      registeredUsers: userCount,
      blockchainTransactions: blockchainCount,
    },
    recentDonations: recentDonations.map((row) => ({
      id: row.id,
      donor: row.donorName,
      campaign: row.campaignTitle,
      amount: row.amount,
      paymentStatus: row.paymentStatus,
      blockchainStatus: row.proofStatus ?? 'pending',
      createdAt: row.createdAt.toISOString(),
    })),
    campaignOverview: campaignOverview.rows.map((row) => ({
      id: row.id,
      title: row.title,
      raisedAmount: row.raisedAmount,
      targetAmount: row.targetAmount,
      status: row.status,
      endDate: row.endDate.toISOString(),
    })),
    charts: {
      donationTrend,
      paymentMethods,
    },
  }
}

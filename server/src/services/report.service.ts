import { requireDb } from '../config/database'
import { count, eq, sql } from 'drizzle-orm'
import {
  beneficiaries,
  blockchainRecords,
  campaigns,
  disbursements,
  donations,
  users,
} from '../database/schema'
import { getAdminDonationStats, getPlatformMonthlyTotals } from '../repositories/donation.repository'
import type { ExportColumn } from '../utils/export'

export interface ReportResult {
  summary: Record<string, number | string>
  columns: ExportColumn[]
  rows: Record<string, unknown>[]
}

const MONTHS_OF_HISTORY = 6

export async function getDonationReport(): Promise<ReportResult> {
  const client = requireDb()
  const since = new Date()
  since.setMonth(since.getMonth() - (MONTHS_OF_HISTORY - 1))

  const [stats, monthly, rows] = await Promise.all([
    getAdminDonationStats(),
    getPlatformMonthlyTotals(since),
    client
      .select({
        id: donations.id,
        donor: users.fullName,
        campaign: campaigns.title,
        amount: donations.amount,
        receiptNumber: donations.receiptNumber,
        proofStatus: sql<string>`coalesce(${blockchainRecords.status}::text, 'pending')`,
        createdAt: donations.createdAt,
      })
      .from(donations)
      .innerJoin(users, eq(users.id, donations.donorId))
      .innerJoin(campaigns, eq(campaigns.id, donations.campaignId))
      .leftJoin(blockchainRecords, eq(blockchainRecords.donationId, donations.id))
      .orderBy(donations.createdAt),
  ])

  return {
    summary: {
      totalDonations: stats.totalCount,
      totalAmount: stats.totalAmount,
      monthToDate: stats.monthAmount,
      monthlyTrend: JSON.stringify(monthly),
    },
    columns: [
      { key: 'id', header: 'Donation ID' },
      { key: 'donor', header: 'Donor' },
      { key: 'campaign', header: 'Campaign' },
      { key: 'amount', header: 'Amount (TZS)' },
      { key: 'receiptNumber', header: 'Receipt Number' },
      { key: 'proofStatus', header: 'Blockchain Status' },
      { key: 'createdAt', header: 'Date' },
    ],
    rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  }
}

export async function getCampaignReport(): Promise<ReportResult> {
  const client = requireDb()

  const [byStatus, rows] = await Promise.all([
    client
      .select({ status: campaigns.status, total: count() })
      .from(campaigns)
      .groupBy(campaigns.status),
    client
      .select({
        id: campaigns.id,
        title: campaigns.title,
        category: campaigns.category,
        status: campaigns.status,
        targetAmount: campaigns.targetAmount,
        raisedAmount: campaigns.raisedAmount,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
      })
      .from(campaigns)
      .orderBy(campaigns.createdAt),
  ])

  const summary: Record<string, number | string> = { totalCampaigns: rows.length }
  for (const row of byStatus) summary[`${row.status}Count`] = row.total

  return {
    summary,
    columns: [
      { key: 'id', header: 'Campaign ID' },
      { key: 'title', header: 'Title' },
      { key: 'category', header: 'Category' },
      { key: 'status', header: 'Status' },
      { key: 'targetAmount', header: 'Target (TZS)' },
      { key: 'raisedAmount', header: 'Raised (TZS)' },
      { key: 'startDate', header: 'Start Date' },
      { key: 'endDate', header: 'End Date' },
    ],
    rows: rows.map((r) => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    })),
  }
}

export async function getBeneficiaryReport(): Promise<ReportResult> {
  const client = requireDb()

  const rows = await client
    .select({
      id: beneficiaries.id,
      name: beneficiaries.name,
      campaign: campaigns.title,
      category: beneficiaries.category,
      location: beneficiaries.location,
      verified: beneficiaries.verified,
      createdAt: beneficiaries.createdAt,
    })
    .from(beneficiaries)
    .innerJoin(campaigns, eq(campaigns.id, beneficiaries.campaignId))
    .orderBy(beneficiaries.createdAt)

  const verified = rows.filter((r) => r.verified).length

  return {
    summary: {
      totalBeneficiaries: rows.length,
      verified,
      unverified: rows.length - verified,
    },
    columns: [
      { key: 'id', header: 'Beneficiary ID' },
      { key: 'name', header: 'Name' },
      { key: 'campaign', header: 'Campaign' },
      { key: 'category', header: 'Category' },
      { key: 'location', header: 'Location' },
      { key: 'verified', header: 'Verified' },
      { key: 'createdAt', header: 'Added' },
    ],
    rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  }
}

export async function getDisbursementReport(): Promise<ReportResult> {
  const client = requireDb()

  const [totals, rows] = await Promise.all([
    client
      .select({
        totalDisbursed: sql<string>`coalesce(sum(${disbursements.amount}) filter (where ${disbursements.status} = 'completed'), 0)`,
        pendingApprovals: sql<string>`count(*) filter (where ${disbursements.status} = 'pending_approval')`,
        completedCount: sql<string>`count(*) filter (where ${disbursements.status} = 'completed')`,
      })
      .from(disbursements),
    client
      .select({
        id: disbursements.id,
        campaign: campaigns.title,
        beneficiary: beneficiaries.name,
        amount: disbursements.amount,
        status: disbursements.status,
        proofStatus: sql<string>`coalesce(${blockchainRecords.status}::text, 'pending')`,
        createdAt: disbursements.createdAt,
      })
      .from(disbursements)
      .innerJoin(campaigns, eq(campaigns.id, disbursements.campaignId))
      .innerJoin(beneficiaries, eq(beneficiaries.id, disbursements.beneficiaryId))
      .leftJoin(blockchainRecords, eq(blockchainRecords.disbursementId, disbursements.id))
      .orderBy(disbursements.createdAt),
  ])

  const verifiedOnChain = rows.filter((r) => r.proofStatus === 'confirmed').length

  return {
    summary: {
      totalDisbursed: Number(totals[0]?.totalDisbursed ?? 0),
      pendingApprovals: Number(totals[0]?.pendingApprovals ?? 0),
      completedCount: Number(totals[0]?.completedCount ?? 0),
      verifiedOnChain,
    },
    columns: [
      { key: 'id', header: 'Disbursement ID' },
      { key: 'campaign', header: 'Campaign' },
      { key: 'beneficiary', header: 'Beneficiary' },
      { key: 'amount', header: 'Amount (TZS)' },
      { key: 'status', header: 'Status' },
      { key: 'proofStatus', header: 'Blockchain Status' },
      { key: 'createdAt', header: 'Date' },
    ],
    rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  }
}

export async function getBlockchainReport(): Promise<ReportResult> {
  const client = requireDb()

  const [byStatus, rows] = await Promise.all([
    client
      .select({ status: blockchainRecords.status, total: count() })
      .from(blockchainRecords)
      .groupBy(blockchainRecords.status),
    client
      .select({
        id: blockchainRecords.id,
        type: sql<string>`case when ${blockchainRecords.donationId} is not null then 'donation' else 'disbursement' end`,
        recordId: sql<number>`coalesce(${blockchainRecords.donationId}, ${blockchainRecords.disbursementId})`,
        status: blockchainRecords.status,
        txHash: blockchainRecords.txHash,
        network: blockchainRecords.network,
        createdAt: blockchainRecords.createdAt,
      })
      .from(blockchainRecords)
      .orderBy(blockchainRecords.createdAt),
  ])

  const summary: Record<string, number | string> = { totalProofs: rows.length }
  for (const row of byStatus) summary[`${row.status}Count`] = row.total

  return {
    summary,
    columns: [
      { key: 'id', header: 'Record ID' },
      { key: 'type', header: 'Type' },
      { key: 'recordId', header: 'Donation/Disbursement ID' },
      { key: 'status', header: 'Status' },
      { key: 'txHash', header: 'Transaction Hash' },
      { key: 'network', header: 'Network' },
      { key: 'createdAt', header: 'Date' },
    ],
    rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  }
}

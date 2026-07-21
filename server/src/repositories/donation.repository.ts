import { and, countDistinct, desc, eq, gte, sql } from 'drizzle-orm'
import { requireDb } from '../config/database'
import {
  blockchainRecords,
  campaigns,
  donations,
  paymentTransactions,
  users,
  type DonationRow,
} from '../database/schema'

export interface RecordDonationInput {
  reference: string
  donorId: number
  campaignId: number
  amount: number
  currency: string
  paymentReference: string
  receiptNumber: string
  providerResponse: unknown
}

/**
 * Atomically turn a verified payment into a donation: create the donation,
 * open its blockchain proof as 'pending' (Stage 5 fills it), link and close the
 * payment transaction, and credit the campaign. The transaction row is locked
 * FOR UPDATE so duplicate callbacks resolve to the same donation instead of
 * double-crediting (flows/payment-flow.md: ignore duplicate callbacks safely).
 */
export async function recordDonation(input: RecordDonationInput): Promise<DonationRow> {
  const client = requireDb()

  return client.transaction(async (tx) => {
    const [txn] = await tx
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.reference, input.reference))
      .for('update')
      .limit(1)

    // Idempotency: a duplicate confirmation returns the existing donation.
    if (txn?.status === 'success' && txn.donationId) {
      const [existing] = await tx
        .select()
        .from(donations)
        .where(eq(donations.id, txn.donationId))
        .limit(1)
      if (existing) return existing
    }

    const [donation] = await tx
      .insert(donations)
      .values({
        donorId: input.donorId,
        campaignId: input.campaignId,
        amount: input.amount,
        currency: input.currency,
        paymentReference: input.paymentReference,
        receiptNumber: input.receiptNumber,
      })
      .returning()

    await tx.insert(blockchainRecords).values({ donationId: donation.id, status: 'pending' })

    await tx
      .update(paymentTransactions)
      .set({
        status: 'success',
        donationId: donation.id,
        providerResponse: input.providerResponse,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.reference, input.reference))

    await tx
      .update(campaigns)
      .set({
        raisedAmount: sql`${campaigns.raisedAmount} + ${input.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, input.campaignId))

    return donation
  })
}

export interface ConfirmBlockchainRecordInput {
  donationId: number
  txHash: string
  network: string
  blockNumber: number
}

/** Mark a donation's blockchain proof confirmed once the chain write lands. */
export async function confirmBlockchainRecord(input: ConfirmBlockchainRecordInput): Promise<void> {
  const client = requireDb()
  await client
    .update(blockchainRecords)
    .set({
      status: 'confirmed',
      txHash: input.txHash,
      network: input.network,
      blockNumber: input.blockNumber,
      recordedAt: new Date(),
    })
    .where(eq(blockchainRecords.donationId, input.donationId))
}

/** A donation joined with the context needed for detail views and receipts. */
export interface DonationDetailRow {
  id: number
  amount: number
  currency: string
  createdAt: Date
  receiptNumber: string
  paymentReference: string
  campaignId: number
  campaignTitle: string
  donorName: string
  donorEmail: string
  proofStatus: (typeof blockchainRecords.status.enumValues)[number] | null
  txHash: string | null
  network: string | null
  paymentStatus: (typeof paymentTransactions.status.enumValues)[number] | null
}

const detailColumns = {
  id: donations.id,
  amount: donations.amount,
  currency: donations.currency,
  createdAt: donations.createdAt,
  receiptNumber: donations.receiptNumber,
  paymentReference: donations.paymentReference,
  campaignId: donations.campaignId,
  campaignTitle: campaigns.title,
  donorName: users.fullName,
  donorEmail: users.email,
  proofStatus: blockchainRecords.status,
  txHash: blockchainRecords.txHash,
  network: blockchainRecords.network,
  paymentStatus: paymentTransactions.status,
} as const

/** One donation owned by a specific donor (owner-scoped). */
export async function findDonationById(
  id: number,
  donorId: number,
): Promise<DonationDetailRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select(detailColumns)
    .from(donations)
    .innerJoin(campaigns, eq(campaigns.id, donations.campaignId))
    .innerJoin(users, eq(users.id, donations.donorId))
    .leftJoin(blockchainRecords, eq(blockchainRecords.donationId, donations.id))
    .leftJoin(paymentTransactions, eq(paymentTransactions.reference, donations.paymentReference))
    .where(and(eq(donations.id, id), eq(donations.donorId, donorId)))
    .limit(1)
  return row
}

/** Public-safe projection for the receipt-number lookup: no donor PII, no payment reference. */
export interface PublicDonationRow {
  id: number
  amount: number
  createdAt: Date
  receiptNumber: string
  campaignId: number
  campaignTitle: string
  proofStatus: (typeof blockchainRecords.status.enumValues)[number] | null
  txHash: string | null
  network: string | null
}

/**
 * Look up a donation by its receipt number for the public verification page
 * (pages/public-verification.md). No auth, no donor-scoping: this is the
 * lookup key by design, and the projection carries no personal data.
 */
export async function findDonationByReceiptNumber(
  receiptNumber: string,
): Promise<PublicDonationRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select({
      id: donations.id,
      amount: donations.amount,
      createdAt: donations.createdAt,
      receiptNumber: donations.receiptNumber,
      campaignId: donations.campaignId,
      campaignTitle: campaigns.title,
      proofStatus: blockchainRecords.status,
      txHash: blockchainRecords.txHash,
      network: blockchainRecords.network,
    })
    .from(donations)
    .innerJoin(campaigns, eq(campaigns.id, donations.campaignId))
    .leftJoin(blockchainRecords, eq(blockchainRecords.donationId, donations.id))
    .where(eq(donations.receiptNumber, receiptNumber))
    .limit(1)
  return row
}

/** All donations by a donor, newest first, with campaign and proof context. */
export async function findDonationsByDonor(donorId: number): Promise<DonationDetailRow[]> {
  const client = requireDb()
  return client
    .select(detailColumns)
    .from(donations)
    .innerJoin(campaigns, eq(campaigns.id, donations.campaignId))
    .innerJoin(users, eq(users.id, donations.donorId))
    .leftJoin(blockchainRecords, eq(blockchainRecords.donationId, donations.id))
    .leftJoin(paymentTransactions, eq(paymentTransactions.reference, donations.paymentReference))
    .where(eq(donations.donorId, donorId))
    .orderBy(desc(donations.createdAt))
}

export interface DonorSummaryRow {
  totalDonated: number
  donationCount: number
  campaignsSupported: number
  verifiedCount: number
}

export async function getDonorSummary(donorId: number): Promise<DonorSummaryRow> {
  const client = requireDb()
  const [row] = await client
    .select({
      totalDonated: sql<string>`coalesce(sum(${donations.amount}), 0)`,
      donationCount: sql<string>`count(${donations.id})`,
      campaignsSupported: countDistinct(donations.campaignId),
      verifiedCount: sql<string>`count(*) filter (where ${blockchainRecords.status} = 'confirmed')`,
    })
    .from(donations)
    .leftJoin(blockchainRecords, eq(blockchainRecords.donationId, donations.id))
    .where(eq(donations.donorId, donorId))

  return {
    totalDonated: Number(row?.totalDonated ?? 0),
    donationCount: Number(row?.donationCount ?? 0),
    campaignsSupported: Number(row?.campaignsSupported ?? 0),
    verifiedCount: Number(row?.verifiedCount ?? 0),
  }
}

export interface MonthlyTotalRow {
  month: string
  total: number
}

/** Monthly donation totals for a donor since a cutoff date (for the chart). */
export async function getDonorMonthlyTotals(
  donorId: number,
  since: Date,
): Promise<MonthlyTotalRow[]> {
  const client = requireDb()
  const rows = await client
    .select({
      month: sql<string>`to_char(date_trunc('month', ${donations.createdAt}), 'YYYY-MM')`,
      total: sql<string>`sum(${donations.amount})`,
    })
    .from(donations)
    .where(and(eq(donations.donorId, donorId), gte(donations.createdAt, since)))
    .groupBy(sql`date_trunc('month', ${donations.createdAt})`)
    .orderBy(sql`date_trunc('month', ${donations.createdAt})`)

  return rows.map((r) => ({ month: r.month, total: Number(r.total) }))
}

/** Distinct donors who have supported a campaign (for campaign event fan-out). */
export async function findDistinctDonorIdsByCampaign(campaignId: number): Promise<number[]> {
  const client = requireDb()
  const rows = await client
    .selectDistinct({ donorId: donations.donorId })
    .from(donations)
    .where(eq(donations.campaignId, campaignId))
  return rows.map((r) => r.donorId)
}

/** Platform-wide monthly donation totals since a cutoff date (dashboard chart). */
export async function getPlatformMonthlyTotals(since: Date): Promise<MonthlyTotalRow[]> {
  const client = requireDb()
  const rows = await client
    .select({
      month: sql<string>`to_char(date_trunc('month', ${donations.createdAt}), 'YYYY-MM')`,
      total: sql<string>`sum(${donations.amount})`,
    })
    .from(donations)
    .where(gte(donations.createdAt, since))
    .groupBy(sql`date_trunc('month', ${donations.createdAt})`)
    .orderBy(sql`date_trunc('month', ${donations.createdAt})`)

  return rows.map((r) => ({ month: r.month, total: Number(r.total) }))
}

export interface PaymentMethodBreakdownRow {
  method: string
  total: number
}

/** Donation totals grouped by payment method (dashboard chart). */
export async function getPaymentMethodBreakdown(): Promise<PaymentMethodBreakdownRow[]> {
  const client = requireDb()
  const rows = await client
    .select({
      method: paymentTransactions.method,
      total: sql<string>`coalesce(sum(${paymentTransactions.amount}), 0)`,
    })
    .from(paymentTransactions)
    .where(eq(paymentTransactions.status, 'success'))
    .groupBy(paymentTransactions.method)

  return rows.map((r) => ({ method: r.method, total: Number(r.total) }))
}

export interface RecentDonationRow {
  id: number
  donorName: string
  campaignTitle: string
  amount: number
  paymentStatus: string
  proofStatus: string | null
  createdAt: Date
}

/** Most recent donations platform-wide, for the admin dashboard table. */
export async function findRecentDonations(limit: number): Promise<RecentDonationRow[]> {
  const client = requireDb()
  return client
    .select({
      id: donations.id,
      donorName: users.fullName,
      campaignTitle: campaigns.title,
      amount: donations.amount,
      paymentStatus: sql<string>`'success'`,
      proofStatus: blockchainRecords.status,
      createdAt: donations.createdAt,
    })
    .from(donations)
    .innerJoin(users, eq(users.id, donations.donorId))
    .innerJoin(campaigns, eq(campaigns.id, donations.campaignId))
    .leftJoin(blockchainRecords, eq(blockchainRecords.donationId, donations.id))
    .orderBy(desc(donations.createdAt))
    .limit(limit)
}

/** Count of proofs (donation or disbursement) confirmed on-chain (dashboard stat). */
export async function countConfirmedBlockchainProofs(): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: sql<string>`count(*)` })
    .from(blockchainRecords)
    .where(eq(blockchainRecords.status, 'confirmed'))
  return Number(row?.total ?? 0)
}

export interface AdminDonationStats {
  totalCount: number
  totalAmount: number
  todayCount: number
  monthAmount: number
}

/** Platform-wide donation aggregates (admin only). */
export async function getAdminDonationStats(): Promise<AdminDonationStats> {
  const client = requireDb()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [row] = await client
    .select({
      totalCount: sql<string>`count(${donations.id})`,
      totalAmount: sql<string>`coalesce(sum(${donations.amount}), 0)`,
      todayCount: sql<string>`count(*) filter (where ${donations.createdAt} >= ${startOfDay})`,
      monthAmount: sql<string>`coalesce(sum(${donations.amount}) filter (where ${donations.createdAt} >= ${startOfMonth}), 0)`,
    })
    .from(donations)

  return {
    totalCount: Number(row?.totalCount ?? 0),
    totalAmount: Number(row?.totalAmount ?? 0),
    todayCount: Number(row?.todayCount ?? 0),
    monthAmount: Number(row?.monthAmount ?? 0),
  }
}

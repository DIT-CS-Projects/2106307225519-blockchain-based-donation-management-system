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

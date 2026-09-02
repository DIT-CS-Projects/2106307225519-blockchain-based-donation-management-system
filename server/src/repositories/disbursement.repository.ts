import { and, count, desc, eq, inArray, sql, type SQL } from 'drizzle-orm'
import { requireDb } from '../config/database'
import {
  beneficiaries,
  blockchainRecords,
  campaigns,
  disbursementApprovals,
  disbursements,
  users,
  type DisbursementRow,
  type NewDisbursementApprovalRow,
  type NewDisbursementRow,
} from '../database/schema'

/** Total completed disbursements for a campaign (available balance math). */
export async function getTotalDisbursed(campaignId: number): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: sql<string>`coalesce(sum(${disbursements.amount}), 0)` })
    .from(disbursements)
    .where(and(eq(disbursements.campaignId, campaignId), eq(disbursements.status, 'completed')))
  return Number(row?.total ?? 0)
}

/**
 * Cumulative amount released on a campaign without administrator approval
 * (Decision 020). Counts self-released payouts that are still live (approved,
 * processing, or completed); failed or rejected payouts never leave the
 * balance and so never consume the self-serve allowance.
 */
export async function getCumulativeSelfReleased(campaignId: number): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: sql<string>`coalesce(sum(${disbursements.amount}), 0)` })
    .from(disbursements)
    .where(
      and(
        eq(disbursements.campaignId, campaignId),
        eq(disbursements.selfReleased, true),
        inArray(disbursements.status, ['approved', 'processing', 'completed']),
      ),
    )
  return Number(row?.total ?? 0)
}

export async function insertDisbursement(data: NewDisbursementRow): Promise<DisbursementRow> {
  const client = requireDb()
  const [row] = await client.insert(disbursements).values(data).returning()
  return row
}

export async function findDisbursementById(id: number): Promise<DisbursementRow | undefined> {
  const client = requireDb()
  const [row] = await client.select().from(disbursements).where(eq(disbursements.id, id)).limit(1)
  return row
}

export type DisbursementPatch = Partial<
  Pick<
    NewDisbursementRow,
    'status' | 'rejectionReason' | 'payoutReference' | 'providerResponse' | 'completedAt'
  >
>

export async function updateDisbursement(
  id: number,
  data: DisbursementPatch,
): Promise<DisbursementRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(disbursements)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(disbursements.id, id))
    .returning()
  return row
}

export async function insertApproval(data: NewDisbursementApprovalRow): Promise<void> {
  const client = requireDb()
  await client.insert(disbursementApprovals).values(data)
}

export interface DisbursementListFilters {
  status?: DisbursementRow['status']
  campaignId?: number
  /** Scope to campaigns owned by this user (fundraiser dashboard). */
  campaignOwnerId?: number
  page: number
  limit: number
}

export interface DisbursementListRow {
  id: number
  campaignId: number
  campaignTitle: string
  beneficiaryId: number
  beneficiaryName: string
  amount: number
  status: DisbursementRow['status']
  initiatedBy: number
  initiatedByName: string
  createdAt: Date
  completedAt: Date | null
  payoutReference: string | null
}

const listColumns = {
  id: disbursements.id,
  campaignId: disbursements.campaignId,
  campaignTitle: campaigns.title,
  beneficiaryId: disbursements.beneficiaryId,
  beneficiaryName: beneficiaries.name,
  amount: disbursements.amount,
  status: disbursements.status,
  initiatedBy: disbursements.initiatedBy,
  initiatedByName: users.fullName,
  createdAt: disbursements.createdAt,
  completedAt: disbursements.completedAt,
  payoutReference: disbursements.payoutReference,
} as const

export async function findDisbursements(
  filters: DisbursementListFilters,
): Promise<{ rows: DisbursementListRow[]; total: number }> {
  const client = requireDb()
  const conditions: SQL[] = []
  if (filters.status) conditions.push(eq(disbursements.status, filters.status))
  if (filters.campaignId) conditions.push(eq(disbursements.campaignId, filters.campaignId))
  if (filters.campaignOwnerId) conditions.push(eq(campaigns.ownerId, filters.campaignOwnerId))
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ total }]] = await Promise.all([
    client
      .select(listColumns)
      .from(disbursements)
      .innerJoin(campaigns, eq(campaigns.id, disbursements.campaignId))
      .innerJoin(beneficiaries, eq(beneficiaries.id, disbursements.beneficiaryId))
      .innerJoin(users, eq(users.id, disbursements.initiatedBy))
      .where(where)
      .orderBy(desc(disbursements.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    // The campaigns join is kept in the count so an owner filter resolves.
    client
      .select({ total: count() })
      .from(disbursements)
      .innerJoin(campaigns, eq(campaigns.id, disbursements.campaignId))
      .where(where),
  ])
  return { rows, total }
}

export interface ApprovalRow {
  id: number
  adminId: number
  adminName: string
  decision: 'approved' | 'rejected'
  reason: string | null
  createdAt: Date
}

export async function findApprovalsForDisbursement(disbursementId: number): Promise<ApprovalRow[]> {
  const client = requireDb()
  return client
    .select({
      id: disbursementApprovals.id,
      adminId: disbursementApprovals.adminId,
      adminName: users.fullName,
      decision: disbursementApprovals.decision,
      reason: disbursementApprovals.reason,
      createdAt: disbursementApprovals.createdAt,
    })
    .from(disbursementApprovals)
    .innerJoin(users, eq(users.id, disbursementApprovals.adminId))
    .where(eq(disbursementApprovals.disbursementId, disbursementId))
    .orderBy(desc(disbursementApprovals.createdAt))
}

export interface DisbursementDetailRow extends DisbursementListRow {
  purpose: string
  rejectionReason: string | null
  proofStatus: (typeof blockchainRecords.status.enumValues)[number] | null
  txHash: string | null
  network: string | null
}

export async function findDisbursementDetail(id: number): Promise<DisbursementDetailRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select({
      ...listColumns,
      purpose: disbursements.purpose,
      rejectionReason: disbursements.rejectionReason,
      proofStatus: blockchainRecords.status,
      txHash: blockchainRecords.txHash,
      network: blockchainRecords.network,
    })
    .from(disbursements)
    .innerJoin(campaigns, eq(campaigns.id, disbursements.campaignId))
    .innerJoin(beneficiaries, eq(beneficiaries.id, disbursements.beneficiaryId))
    .innerJoin(users, eq(users.id, disbursements.initiatedBy))
    .leftJoin(blockchainRecords, eq(blockchainRecords.disbursementId, disbursements.id))
    .where(eq(disbursements.id, id))
    .limit(1)
  return row
}

// --- Blockchain proof (mirrors donation.repository.ts's pattern) ---

export async function openDisbursementProof(disbursementId: number): Promise<void> {
  const client = requireDb()
  await client.insert(blockchainRecords).values({ disbursementId, status: 'pending' })
}

export async function confirmDisbursementProof(input: {
  disbursementId: number
  txHash: string
  network: string
  blockNumber: number
}): Promise<void> {
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
    .where(eq(blockchainRecords.disbursementId, input.disbursementId))
}

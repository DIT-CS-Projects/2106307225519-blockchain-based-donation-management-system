import { findCampaignByIdAdmin } from '../repositories/campaign.repository'
import { findVerifiedBeneficiaryInCampaign } from '../repositories/beneficiary.repository'
import {
  confirmDisbursementProof,
  findApprovalsForDisbursement,
  findDisbursementDetail,
  findDisbursementById,
  findDisbursements,
  getTotalDisbursed,
  insertApproval,
  insertDisbursement,
  openDisbursementProof,
  updateDisbursement,
  type ApprovalRow,
  type DisbursementDetailRow,
  type DisbursementListFilters,
  type DisbursementListRow,
} from '../repositories/disbursement.repository'
import { getDisbursementProvider } from './disbursement'
import {
  computeDisbursementProofHash,
  isBlockchainConfigured,
  recordDisbursementProof,
} from './blockchain.service'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { notify } from './notification.service'
import { findUserIdsByRole } from '../repositories/user.repository'
import { DUAL_APPROVAL_THRESHOLD_TZS, PAYOUT_REFERENCE_PREFIX } from '../constants/disbursements'
import { generateReference } from '../utils/reference'
import { formatTZS } from '../utils/format'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import type { DisbursementRow } from '../database/schema'
import type { InitiateDisbursementInput } from '../validation/disbursement'

export interface AvailableBalance {
  campaignId: number
  totalRaised: number
  totalDisbursed: number
  availableBalance: number
}

/** Available balance = total raised - total COMPLETED disbursements (flows/disbursement-flow.md). */
export async function getAvailableBalance(campaignId: number): Promise<AvailableBalance> {
  const campaign = await findCampaignByIdAdmin(campaignId)
  if (!campaign) throw ApiError.notFound('Campaign not found')

  const totalDisbursed = await getTotalDisbursed(campaignId)
  return {
    campaignId,
    totalRaised: campaign.raisedAmount,
    totalDisbursed,
    availableBalance: campaign.raisedAmount - totalDisbursed,
  }
}

export interface DisbursementDto {
  id: number
  campaignId: number
  campaignTitle: string
  beneficiaryId: number
  beneficiaryName: string
  amount: number
  status: DisbursementRow['status']
  initiatedBy: number
  initiatedByName: string
  createdAt: string
  completedAt: string | null
}

function toDto(row: DisbursementListRow): DisbursementDto {
  return {
    id: row.id,
    campaignId: row.campaignId,
    campaignTitle: row.campaignTitle,
    beneficiaryId: row.beneficiaryId,
    beneficiaryName: row.beneficiaryName,
    amount: row.amount,
    status: row.status,
    initiatedBy: row.initiatedBy,
    initiatedByName: row.initiatedByName,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  }
}

export interface DisbursementListResult {
  items: DisbursementDto[]
  total: number
  page: number
  limit: number
}

export async function listDisbursements(
  filters: DisbursementListFilters,
): Promise<DisbursementListResult> {
  const { rows, total } = await findDisbursements(filters)
  return { items: rows.map(toDto), total, page: filters.page, limit: filters.limit }
}

export interface DisbursementDetailDto extends DisbursementDto {
  purpose: string
  rejectionReason: string | null
  payoutReference: string | null
  blockchain: { status: string; txHash: string | null; network: string | null }
  approvals: { id: number; admin: string; decision: string; reason: string | null; createdAt: string }[]
}

function toDetailDto(row: DisbursementDetailRow, approvals: ApprovalRow[]): DisbursementDetailDto {
  return {
    ...toDto(row),
    purpose: row.purpose,
    rejectionReason: row.rejectionReason,
    payoutReference: row.payoutReference,
    blockchain: {
      status: row.proofStatus ?? 'pending',
      txHash: row.txHash,
      network: row.network,
    },
    approvals: approvals.map((a) => ({
      id: a.id,
      admin: a.adminName,
      decision: a.decision,
      reason: a.reason,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function getDisbursementDetail(id: number): Promise<DisbursementDetailDto> {
  const row = await findDisbursementDetail(id)
  if (!row) throw ApiError.notFound('Disbursement not found')
  const approvals = await findApprovalsForDisbursement(id)
  return toDetailDto(row, approvals)
}

/**
 * Initiate a disbursement (flows/disbursement-flow.md). Below the threshold it
 * is auto-approved and paid out immediately; at or above it, a second
 * administrator must approve first (Decision 016).
 */
export async function initiateDisbursement(
  adminId: number,
  input: InitiateDisbursementInput,
): Promise<DisbursementDto> {
  const campaign = await findCampaignByIdAdmin(input.campaignId)
  if (!campaign) throw ApiError.badRequest('Campaign not found')

  const beneficiary = await findVerifiedBeneficiaryInCampaign(input.beneficiaryId, input.campaignId)
  if (!beneficiary) {
    throw ApiError.badRequest('Beneficiary must be verified and belong to this campaign')
  }

  const totalDisbursed = await getTotalDisbursed(input.campaignId)
  const availableBalance = campaign.raisedAmount - totalDisbursed
  if (input.amount > availableBalance) {
    throw new ApiError(409, `Amount exceeds the available balance of ${formatTZS(availableBalance)}`)
  }

  const autoApproved = input.amount < DUAL_APPROVAL_THRESHOLD_TZS
  const row = await insertDisbursement({
    campaignId: input.campaignId,
    beneficiaryId: input.beneficiaryId,
    amount: input.amount,
    purpose: input.purpose,
    status: autoApproved ? 'approved' : 'pending_approval',
    initiatedBy: adminId,
  })

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.disbursementInitiate,
    entityType: 'disbursement',
    entityId: row.id,
    details: { campaignId: row.campaignId, beneficiaryId: row.beneficiaryId, amount: row.amount },
  })

  if (autoApproved) {
    void processPayout(row)
  }

  const detail = await findDisbursementDetail(row.id)
  return toDto(detail!)
}

/** Only a different administrator than the initiator may approve (Decision 016). */
export async function approveDisbursement(adminId: number, id: number): Promise<DisbursementDto> {
  const row = await findDisbursementById(id)
  if (!row) throw ApiError.notFound('Disbursement not found')
  if (row.status !== 'pending_approval') {
    throw ApiError.badRequest('Only disbursements pending approval can be approved')
  }
  if (row.initiatedBy === adminId) {
    throw new ApiError(409, 'You cannot approve a disbursement you initiated')
  }

  await insertApproval({ disbursementId: id, adminId, decision: 'approved' })
  const updated = await updateDisbursement(id, { status: 'approved' })
  if (!updated) throw ApiError.notFound('Disbursement not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.disbursementApprove,
    entityType: 'disbursement',
    entityId: id,
  })

  void processPayout(updated)

  const detail = await findDisbursementDetail(id)
  return toDto(detail!)
}

export async function rejectDisbursement(
  adminId: number,
  id: number,
  reason: string,
): Promise<DisbursementDto> {
  const row = await findDisbursementById(id)
  if (!row) throw ApiError.notFound('Disbursement not found')
  if (row.status !== 'pending_approval') {
    throw ApiError.badRequest('Only disbursements pending approval can be rejected')
  }

  await insertApproval({ disbursementId: id, adminId, decision: 'rejected', reason })
  const updated = await updateDisbursement(id, { status: 'rejected', rejectionReason: reason })
  if (!updated) throw ApiError.notFound('Disbursement not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.disbursementReject,
    entityType: 'disbursement',
    entityId: id,
    details: { reason },
  })

  return toDto((await findDisbursementDetail(id))!)
}

/**
 * Queue and (in mock mode) instantly complete a payout, then fire the
 * blockchain proof, exactly like a donation (Decision 016). Runs
 * fire-and-forget from the caller so initiation/approval responses return
 * immediately; failures mark the disbursement 'failed' and funds remain
 * available for a retry (flows/disbursement-flow.md).
 */
async function processPayout(disbursement: DisbursementRow): Promise<void> {
  try {
    await updateDisbursement(disbursement.id, { status: 'processing' })

    const provider = getDisbursementProvider()
    const reference = generateReference(PAYOUT_REFERENCE_PREFIX)
    const beneficiaryName = (await findDisbursementDetail(disbursement.id))?.beneficiaryName ?? ''
    const result = await provider.queuePayout({
      reference,
      amount: disbursement.amount,
      beneficiaryName,
      purpose: disbursement.purpose,
    })

    if (!result.completedImmediately) {
      // Real provider path: stays 'processing' until POST /disbursements/callback lands.
      await updateDisbursement(disbursement.id, {
        payoutReference: reference,
        providerResponse: result.raw ?? null,
      })
      return
    }

    const completedAt = new Date()
    await updateDisbursement(disbursement.id, {
      status: 'completed',
      payoutReference: reference,
      providerResponse: result.raw ?? null,
      completedAt,
    })

    void recordDisbursementBlockchainProof({ ...disbursement, completedAt })
    void notifyAdminsOfCompletion(disbursement, true)
  } catch (error) {
    logger.error(`Disbursement ${disbursement.id} payout failed:`, error)
    await updateDisbursement(disbursement.id, { status: 'failed' })
    void notifyAdminsOfCompletion(disbursement, false)
  }
}

async function notifyAdminsOfCompletion(disbursement: DisbursementRow, success: boolean): Promise<void> {
  const adminIds = await findUserIdsByRole('admin')
  if (adminIds.length === 0) return
  await notify({
    userIds: adminIds,
    type: success ? 'disbursement_completed' : 'disbursement_failed',
    title: success ? 'Disbursement completed' : 'Disbursement failed',
    message: success
      ? `A payout of ${formatTZS(disbursement.amount)} was completed successfully.`
      : `A payout of ${formatTZS(disbursement.amount)} failed. Funds remain available to retry.`,
    link: `/admin/disbursements/${disbursement.id}`,
  })
}

async function recordDisbursementBlockchainProof(
  disbursement: DisbursementRow & { completedAt: Date },
): Promise<void> {
  if (!isBlockchainConfigured()) return
  try {
    await openDisbursementProof(disbursement.id)
    const proofHash = computeDisbursementProofHash({
      disbursementId: disbursement.id,
      campaignId: disbursement.campaignId,
      amount: disbursement.amount,
      completedAt: disbursement.completedAt,
    })
    const result = await recordDisbursementProof({
      disbursementId: disbursement.id,
      campaignId: disbursement.campaignId,
      proofHash,
    })
    await confirmDisbursementProof({ disbursementId: disbursement.id, ...result })
    logger.info(`Blockchain proof confirmed for disbursement ${disbursement.id}`)
  } catch (error) {
    logger.error(`Failed to record blockchain proof for disbursement ${disbursement.id}:`, error)
  }
}

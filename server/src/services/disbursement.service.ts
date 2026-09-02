import { findVerifiedBeneficiaryInCampaign } from '../repositories/beneficiary.repository'
import {
  confirmDisbursementProof,
  findApprovalsForDisbursement,
  findDisbursementById,
  findDisbursementDetail,
  findDisbursements,
  getCumulativeSelfReleased,
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
import { assertCampaignManageable, type Actor } from './campaign.service'
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
  /** Cumulative amount released so far without administrator approval (Decision 020). */
  cumulativeSelfReleased: number
  /** Headroom left before a payout needs administrator approval. */
  selfServeRemaining: number
}

/** Available balance = total raised - total COMPLETED disbursements (flows/disbursement-flow.md). */
export async function getAvailableBalance(
  actor: Actor,
  campaignId: number,
): Promise<AvailableBalance> {
  const campaign = await assertCampaignManageable(actor, campaignId)

  const [totalDisbursed, cumulativeSelfReleased] = await Promise.all([
    getTotalDisbursed(campaignId),
    getCumulativeSelfReleased(campaignId),
  ])
  return {
    campaignId,
    totalRaised: campaign.raisedAmount,
    totalDisbursed,
    availableBalance: campaign.raisedAmount - totalDisbursed,
    cumulativeSelfReleased,
    selfServeRemaining: Math.max(0, DUAL_APPROVAL_THRESHOLD_TZS - cumulativeSelfReleased),
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
  actor: Actor,
  filters: DisbursementListFilters,
): Promise<DisbursementListResult> {
  // A fundraiser only ever sees payouts on the campaigns they own.
  const scoped: DisbursementListFilters =
    actor.role === 'fundraiser' ? { ...filters, campaignOwnerId: actor.id } : filters
  let { rows, total } = await findDisbursements(scoped)

  // The automatic poll started at approval time only runs for a few minutes
  // (see pollPayoutCompletion); a payout ClickPesa settles after that window,
  // or across a server restart, would otherwise sit at 'processing' forever
  // with the funds never marked spent. Reconcile any such rows whenever an
  // admin actually looks at the list.
  const stale = rows.filter((r) => r.status === 'processing' && r.payoutReference)
  if (stale.length > 0) {
    const reconciled = await Promise.all(
      stale.map((r) => reconcileIfProcessing(r.id, r.status, r.payoutReference)),
    )
    if (reconciled.some(Boolean)) {
      ;({ rows, total } = await findDisbursements(scoped))
    }
  }

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

export async function getDisbursementDetail(
  actor: Actor,
  id: number,
): Promise<DisbursementDetailDto> {
  let row = await findDisbursementDetail(id)
  if (!row) throw ApiError.notFound('Disbursement not found')
  // A fundraiser may only view payouts on campaigns they own.
  if (actor.role !== 'admin') {
    await assertCampaignManageable(actor, row.campaignId)
  }
  if (await reconcileIfProcessing(row.id, row.status, row.payoutReference)) {
    row = (await findDisbursementDetail(id))!
  }
  const approvals = await findApprovalsForDisbursement(id)
  return toDetailDto(row, approvals)
}

/**
 * Initiate a disbursement (flows/disbursement-flow.md, Decision 020). The
 * initiator is the campaign owner: a fundraiser on their own campaign, or an
 * administrator on any campaign. The dual-approval threshold applies to the
 * campaign's cumulative self-released total for a fundraiser, and to the single
 * payout amount for an administrator (the existing rule). A payout that keeps
 * the campaign under the threshold is auto-approved and paid immediately; one
 * that reaches it waits for an administrator's approval.
 */
export async function initiateDisbursement(
  actor: Actor,
  input: InitiateDisbursementInput,
): Promise<DisbursementDto> {
  const campaign = await assertCampaignManageable(actor, input.campaignId)

  const beneficiary = await findVerifiedBeneficiaryInCampaign(input.beneficiaryId, input.campaignId)
  if (!beneficiary) {
    throw ApiError.badRequest('Beneficiary must be verified and belong to this campaign')
  }
  if (!beneficiary.mobileNumber) {
    throw ApiError.badRequest('The beneficiary must have a mobile number before receiving a payout')
  }

  const totalDisbursed = await getTotalDisbursed(input.campaignId)
  const availableBalance = campaign.raisedAmount - totalDisbursed
  if (input.amount > availableBalance) {
    throw new ApiError(409, `Amount exceeds the available balance of ${formatTZS(availableBalance)}`)
  }

  let requiresApproval: boolean
  if (actor.role === 'admin') {
    // Administrators keep the per-payout rule (Decision 016).
    requiresApproval = input.amount >= DUAL_APPROVAL_THRESHOLD_TZS
  } else {
    // Fundraisers are measured on the campaign's cumulative self-released total.
    const cumulative = await getCumulativeSelfReleased(input.campaignId)
    requiresApproval = cumulative + input.amount >= DUAL_APPROVAL_THRESHOLD_TZS
  }
  const autoApproved = !requiresApproval

  const row = await insertDisbursement({
    campaignId: input.campaignId,
    beneficiaryId: input.beneficiaryId,
    amount: input.amount,
    purpose: input.purpose,
    status: autoApproved ? 'approved' : 'pending_approval',
    // Auto-approved payouts are self-released and count toward the cap; those
    // that go through administrator approval do not.
    selfReleased: autoApproved,
    initiatedBy: actor.id,
  })

  void recordAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.disbursementInitiate,
    entityType: 'disbursement',
    entityId: row.id,
    details: { campaignId: row.campaignId, beneficiaryId: row.beneficiaryId, amount: row.amount },
  })

  if (autoApproved) {
    void processPayout(row, beneficiary.mobileNumber)
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

  const beneficiary = await findVerifiedBeneficiaryInCampaign(row.beneficiaryId, row.campaignId)
  if (!beneficiary?.mobileNumber) {
    throw ApiError.badRequest('The beneficiary must have a mobile number before a payout can be approved')
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

  void processPayout(updated, beneficiary.mobileNumber)

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
async function processPayout(disbursement: DisbursementRow, beneficiaryMobileNumber: string): Promise<void> {
  try {
    await updateDisbursement(disbursement.id, { status: 'processing' })

    const provider = getDisbursementProvider()
    const reference = generateReference(PAYOUT_REFERENCE_PREFIX)
    const beneficiaryName = (await findDisbursementDetail(disbursement.id))?.beneficiaryName ?? ''
    const result = await provider.queuePayout({
      reference,
      amount: disbursement.amount,
      beneficiaryName,
      beneficiaryMobileNumber,
      purpose: disbursement.purpose,
    })

    if (!result.completedImmediately) {
      // ClickPesa accepts some payouts asynchronously. Keep the record in
      // processing and reconcile by its unique reference; this never creates a
      // second payout request.
      await updateDisbursement(disbursement.id, {
        payoutReference: reference,
        providerResponse: result.raw ?? null,
      })
      void pollPayoutCompletion(disbursement, reference)
      return
    }

    await completePayout(disbursement, reference, result.raw)
  } catch (error) {
    logger.error(`Disbursement ${disbursement.id} payout failed:`, error)
    await updateDisbursement(disbursement.id, { status: 'failed' })
    void notifyAdminsOfCompletion(disbursement, false)
  }
}

const PAYOUT_STATUS_DELAYS_MS = [5_000, 10_000, 20_000, 40_000, 60_000]
const FAILED_PAYOUT_STATUSES = new Set(['FAILED', 'REVERSED', 'REFUNDED'])

/**
 * Reconcile an accepted ClickPesa payout without ever re-submitting it. This
 * in-memory loop only covers the ~2 minutes right after approval; it does not
 * survive a server restart or deploy. `reconcileIfProcessing` is the durable
 * backstop that catches anything this loop misses.
 */
async function pollPayoutCompletion(disbursement: DisbursementRow, reference: string): Promise<void> {
  const provider = getDisbursementProvider()
  if (!provider.getPayoutStatus) return

  for (const delay of PAYOUT_STATUS_DELAYS_MS) {
    await new Promise<void>((resolve) => setTimeout(resolve, delay))
    try {
      const status = await provider.getPayoutStatus(reference)
      if (status === 'SUCCESS') {
        await completePayout(disbursement, reference)
        return
      }
      if (status && FAILED_PAYOUT_STATUSES.has(status)) {
        await updateDisbursement(disbursement.id, { status: 'failed' })
        void notifyAdminsOfCompletion(disbursement, false)
        return
      }
    } catch (error) {
      // Leave the status as processing: a transient status lookup failure is
      // not evidence that the recipient did not receive funds.
      logger.warn(`Could not reconcile payout ${reference}: ${(error as Error).message}`)
    }
  }
}

/**
 * Durable reconciliation for a disbursement stuck in 'processing': queried
 * live whenever an admin loads the list or detail view, so a payout that
 * ClickPesa settles after `pollPayoutCompletion` gives up (or across a
 * server restart, which drops that in-memory loop entirely) still gets
 * marked completed and its blockchain proof recorded, instead of leaving
 * the campaign's available balance never debited for money that was
 * actually paid out. Returns true when the row's status changed.
 */
async function reconcileIfProcessing(
  id: number,
  status: DisbursementRow['status'],
  payoutReference: string | null,
): Promise<boolean> {
  if (status !== 'processing' || !payoutReference) return false
  const provider = getDisbursementProvider()
  if (!provider.getPayoutStatus) return false

  try {
    const providerStatus = await provider.getPayoutStatus(payoutReference)
    if (providerStatus === 'SUCCESS') {
      const row = await findDisbursementById(id)
      if (!row) return false
      await completePayout(row, payoutReference)
      return true
    }
    if (providerStatus && FAILED_PAYOUT_STATUSES.has(providerStatus)) {
      const row = await findDisbursementById(id)
      await updateDisbursement(id, { status: 'failed' })
      if (row) void notifyAdminsOfCompletion(row, false)
      return true
    }
  } catch (error) {
    // Transient lookup failure: leave it as processing and try again next view.
    logger.warn(`Could not reconcile payout ${payoutReference}: ${(error as Error).message}`)
  }
  return false
}

async function completePayout(
  disbursement: DisbursementRow,
  reference: string,
  providerResponse?: unknown,
): Promise<void> {
  const completedAt = new Date()
  await updateDisbursement(disbursement.id, {
    status: 'completed',
    payoutReference: reference,
    ...(providerResponse === undefined ? {} : { providerResponse }),
    completedAt,
  })
  void recordDisbursementBlockchainProof({ ...disbursement, completedAt })
  void notifyAdminsOfCompletion(disbursement, true)
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

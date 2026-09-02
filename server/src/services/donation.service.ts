import {
  confirmBlockchainRecord,
  findDonationById,
  findDonationByReceiptNumber,
  findDonationsByDonor,
  findDonationsMissingProof,
  getAdminDonationStats,
  getDonorMonthlyTotals,
  getDonorSummary,
  type DonationDetailRow,
} from '../repositories/donation.repository'
import {
  computeProofHash,
  currentNetworkLabel,
  isBlockchainConfigured,
  reconcileProof,
  recordDonationProof,
} from './blockchain.service'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import type { DonationRow } from '../database/schema'

export type ProofStatus = 'pending' | 'confirmed' | 'failed'

export interface DonationDto {
  id: number
  amount: number
  currency: string
  createdAt: string
  receiptNumber: string
  paymentReference: string
  campaignId: number
  campaignTitle: string
  paymentStatus: string
  blockchain: {
    status: ProofStatus
    txHash: string | null
    network: string | null
  }
}

function toDto(row: DonationDetailRow): DonationDto {
  return {
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    createdAt: row.createdAt.toISOString(),
    receiptNumber: row.receiptNumber,
    paymentReference: row.paymentReference,
    campaignId: row.campaignId,
    campaignTitle: row.campaignTitle,
    paymentStatus: row.paymentStatus ?? 'success',
    blockchain: {
      status: (row.proofStatus ?? 'pending') as ProofStatus,
      txHash: row.txHash,
      network: row.network,
    },
  }
}

/**
 * Write a donation's blockchain proof and confirm it in Postgres. Callers
 * invoke this without awaiting it (flows/payment-flow.md), so a slow or
 * unavailable chain never blocks the payment callback response. On failure
 * the proof simply stays 'pending' and heals on the next verify call.
 */
export async function recordBlockchainProof(donation: DonationRow): Promise<void> {
  if (!isBlockchainConfigured()) return

  try {
    const proofHash = computeProofHash({
      donationId: donation.id,
      campaignId: donation.campaignId,
      amount: donation.amount,
      receiptNumber: donation.receiptNumber,
      paymentReference: donation.paymentReference,
      createdAt: donation.createdAt,
    })
    const result = await recordDonationProof({
      donationId: donation.id,
      campaignId: donation.campaignId,
      proofHash,
    })
    await confirmBlockchainRecord({ donationId: donation.id, ...result })
    logger.info(`Blockchain proof confirmed for donation ${donation.id} (tx ${result.txHash || 'reconciled'})`)
  } catch (error) {
    logger.error(`Failed to record blockchain proof for donation ${donation.id}:`, error)
  }
}

export interface ProofRepairResult {
  network: string
  missing: number
  recorded: number
  stillMissing: number
}

/**
 * Re-record every donation proof that is missing on the current chain. Covers
 * donations that predate the contract, ones whose background write failed, and
 * ones proved against a chain we no longer use. Recording is idempotent: a
 * proof already on-chain reconciles rather than failing, so this is safe to run
 * more than once. Sequential on purpose, so the wallet's nonces stay in order.
 */
export async function repairMissingProofs(): Promise<ProofRepairResult> {
  if (!isBlockchainConfigured()) {
    throw new ApiError(503, 'Blockchain is not configured on this server.')
  }

  const network = currentNetworkLabel()
  const pending = await findDonationsMissingProof(network)

  for (const donation of pending) {
    // Swallows and logs its own failures, so one bad row cannot abort the run.
    await recordBlockchainProof(donation)
  }

  const stillMissing = (await findDonationsMissingProof(network)).length
  const result = {
    network,
    missing: pending.length,
    recorded: pending.length - stillMissing,
    stillMissing,
  }
  logger.info(
    `Proof repair on ${network}: ${result.recorded}/${result.missing} recorded, ${stillMissing} still missing.`,
  )
  return result
}

export async function getHistory(donorId: number): Promise<DonationDto[]> {
  const rows = await findDonationsByDonor(donorId)
  return rows.map(toDto)
}

export interface DonorSummary {
  totalDonated: number
  campaignsSupported: number
  donationCount: number
  verifiedCount: number
  monthly: { month: string; total: number }[]
}

const MONTHS_OF_HISTORY = 6

export async function getSummary(donorId: number): Promise<DonorSummary> {
  const since = new Date()
  since.setMonth(since.getMonth() - (MONTHS_OF_HISTORY - 1))
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const [summary, monthly] = await Promise.all([
    getDonorSummary(donorId),
    getDonorMonthlyTotals(donorId, since),
  ])

  return { ...summary, monthly }
}

/** A single donation owned by the donor, or 404. */
export async function getDonation(donorId: number, id: number): Promise<DonationDto> {
  const row = await findDonationById(id, donorId)
  if (!row) {
    throw ApiError.notFound('Donation not found')
  }
  return toDto(row)
}

export interface VerificationResult {
  donationId: number
  status: ProofStatus
  txHash: string | null
  network: string | null
  verified: boolean
  message: string
}

const VERIFY_MESSAGES: Record<ProofStatus, string> = {
  pending: 'This donation is queued for its blockchain proof.',
  confirmed: 'This donation is permanently recorded on the blockchain.',
  failed: 'The blockchain proof could not be recorded. Support has been notified.',
}

/**
 * Blockchain verification for a donation (flows/blockchain-flow.md: "Backend
 * Queries Blockchain"). A confirmed record is trusted as cached; a pending one
 * gets a live, no-gas contract read so a proof recorded after a crashed
 * background job still surfaces without waiting on a retry job.
 */
export async function verifyDonation(
  donorId: number,
  id: number,
): Promise<VerificationResult> {
  const row = await findDonationById(id, donorId)
  if (!row) {
    throw ApiError.notFound('Donation not found')
  }

  let status = (row.proofStatus ?? 'pending') as ProofStatus
  let txHash = row.txHash
  let network = row.network

  if (status === 'pending' && isBlockchainConfigured()) {
    const expectedHash = computeProofHash({
      donationId: row.id,
      campaignId: row.campaignId,
      amount: row.amount,
      receiptNumber: row.receiptNumber,
      paymentReference: row.paymentReference,
      createdAt: row.createdAt,
    })
    const found = await reconcileProof(row.id, expectedHash).catch(() => null)
    if (found) {
      await confirmBlockchainRecord({ donationId: row.id, ...found })
      status = 'confirmed'
      txHash = found.txHash
      network = found.network
    }
  }

  return {
    donationId: row.id,
    status,
    txHash,
    network,
    verified: status === 'confirmed',
    message: VERIFY_MESSAGES[status],
  }
}

export interface PublicVerificationResult {
  status: 'pending' | 'verified'
  type: 'donation'
  campaignId: number
  campaignTitle: string
  amount: number
  createdAt: string
  receiptNumber: string
  txHash: string | null
  network: string | null
}

/**
 * Public transparency lookup by receipt number, no account required
 * (pages/public-verification.md). Never returns donor name, email, or payment
 * reference. Reads the cached proof status rather than live-querying the
 * chain: the donor's own /verify call (or the background recording job)
 * already reconciles it, so this stays a fast, no-RPC read.
 */
export async function getPublicVerification(receiptNumber: string): Promise<PublicVerificationResult> {
  const row = await findDonationByReceiptNumber(receiptNumber)
  if (!row) {
    throw ApiError.notFound('No verified record found for this receipt')
  }
  const confirmed = row.proofStatus === 'confirmed'
  return {
    status: confirmed ? 'verified' : 'pending',
    type: 'donation',
    campaignId: row.campaignId,
    campaignTitle: row.campaignTitle,
    amount: row.amount,
    createdAt: row.createdAt.toISOString(),
    receiptNumber: row.receiptNumber,
    txHash: confirmed ? row.txHash : null,
    network: confirmed ? row.network : null,
  }
}

/** The detail row (with donor and campaign) used to render a PDF receipt. */
export async function getReceiptData(
  donorId: number,
  id: number,
): Promise<DonationDetailRow> {
  const row = await findDonationById(id, donorId)
  if (!row) {
    throw ApiError.notFound('Donation not found')
  }
  return row
}

export interface DonationStatistics {
  totalCount: number
  totalAmount: number
  todayCount: number
  monthAmount: number
}

export async function getStatistics(): Promise<DonationStatistics> {
  return getAdminDonationStats()
}

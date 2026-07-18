import {
  findDonationById,
  findDonationsByDonor,
  getAdminDonationStats,
  getDonorMonthlyTotals,
  getDonorSummary,
  type DonationDetailRow,
} from '../repositories/donation.repository'
import { ApiError } from '../utils/ApiError'

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

/**
 * Blockchain verification for a donation. Until Stage 5 writes proofs on-chain,
 * every record is 'pending' and reports that the proof is being prepared.
 */
export async function verifyDonation(
  donorId: number,
  id: number,
): Promise<VerificationResult> {
  const row = await findDonationById(id, donorId)
  if (!row) {
    throw ApiError.notFound('Donation not found')
  }
  const status = (row.proofStatus ?? 'pending') as ProofStatus
  const messages: Record<ProofStatus, string> = {
    pending: 'This donation is queued for its blockchain proof.',
    confirmed: 'This donation is permanently recorded on the blockchain.',
    failed: 'The blockchain proof could not be recorded. Support has been notified.',
  }
  return {
    donationId: row.id,
    status,
    txHash: row.txHash,
    network: row.network,
    verified: status === 'confirmed',
    message: messages[status],
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

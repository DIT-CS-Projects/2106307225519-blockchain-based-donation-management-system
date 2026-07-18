import { api } from '@/services/api'

// Contract: api/donations.md (base path /api/donations). All calls require auth.

export type ProofStatus = 'pending' | 'confirmed' | 'failed'

export interface Donation {
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

export interface DonorSummary {
  totalDonated: number
  campaignsSupported: number
  donationCount: number
  verifiedCount: number
  monthly: { month: string; total: number }[]
}

export interface DonationVerification {
  donationId: number
  status: ProofStatus
  txHash: string | null
  network: string | null
  verified: boolean
  message: string
}

export async function getDonationHistory(): Promise<Donation[]> {
  const { data } = await api.get<{ items: Donation[] }>('/donations/history')
  return data.items
}

export async function getDonationSummary(): Promise<DonorSummary> {
  const { data } = await api.get<DonorSummary>('/donations/summary')
  return data
}

export async function getDonation(id: number | string): Promise<Donation> {
  const { data } = await api.get<{ donation: Donation }>(`/donations/${id}`)
  return data.donation
}

export async function verifyDonation(id: number | string): Promise<DonationVerification> {
  const { data } = await api.get<DonationVerification>(`/donations/${id}/verify`)
  return data
}

/** Fetch the PDF receipt as a blob (the request carries the auth header). */
export async function downloadReceipt(id: number | string): Promise<Blob> {
  const { data } = await api.get<Blob>(`/donations/${id}/receipt`, {
    responseType: 'blob',
  })
  return data
}

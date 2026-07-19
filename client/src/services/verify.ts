import { api } from '@/services/api'

// Contract: pages/public-verification.md (GET /api/verify/:receiptNumber, public).

export interface PublicVerification {
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

export async function verifyReceipt(receiptNumber: string): Promise<PublicVerification> {
  const { data } = await api.get<PublicVerification>(
    `/verify/${encodeURIComponent(receiptNumber)}`,
  )
  return data
}

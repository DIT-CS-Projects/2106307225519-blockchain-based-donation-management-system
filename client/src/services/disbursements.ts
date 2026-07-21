import { api } from '@/services/api'

// Contract: api/disbursements.md (base path /api/disbursements). Admin only.

export type DisbursementStatus =
  | 'pending_approval'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'

export interface Disbursement {
  id: number
  campaignId: number
  campaignTitle: string
  beneficiaryId: number
  beneficiaryName: string
  amount: number
  status: DisbursementStatus
  initiatedBy: number
  initiatedByName: string
  createdAt: string
  completedAt: string | null
}

export interface DisbursementDetail extends Disbursement {
  purpose: string
  rejectionReason: string | null
  payoutReference: string | null
  blockchain: { status: string; txHash: string | null; network: string | null }
  approvals: { id: number; admin: string; decision: string; reason: string | null; createdAt: string }[]
}

export interface DisbursementListParams {
  status?: DisbursementStatus
  campaignId?: number
  page?: number
  limit?: number
}

export interface DisbursementListResult {
  items: Disbursement[]
  total: number
  page: number
  limit: number
}

export async function getDisbursements(
  params: DisbursementListParams = {},
): Promise<DisbursementListResult> {
  const { data } = await api.get<DisbursementListResult>('/disbursements', { params })
  return data
}

export async function getDisbursement(id: number): Promise<DisbursementDetail> {
  const { data } = await api.get<{ disbursement: DisbursementDetail }>(`/disbursements/${id}`)
  return data.disbursement
}

export interface AvailableBalance {
  campaignId: number
  totalRaised: number
  totalDisbursed: number
  availableBalance: number
}

export async function getAvailableBalance(campaignId: number): Promise<AvailableBalance> {
  const { data } = await api.get<AvailableBalance>(`/disbursements/balance/${campaignId}`)
  return data
}

export interface InitiateDisbursementInput {
  campaignId: number
  beneficiaryId: number
  amount: number
  purpose: string
}

export async function initiateDisbursement(input: InitiateDisbursementInput): Promise<Disbursement> {
  const { data } = await api.post<{ disbursement: Disbursement }>('/disbursements', input)
  return data.disbursement
}

export async function approveDisbursement(id: number): Promise<Disbursement> {
  const { data } = await api.post<{ disbursement: Disbursement }>(`/disbursements/${id}/approve`)
  return data.disbursement
}

export async function rejectDisbursement(id: number, reason: string): Promise<Disbursement> {
  const { data } = await api.post<{ disbursement: Disbursement }>(`/disbursements/${id}/reject`, {
    reason,
  })
  return data.disbursement
}

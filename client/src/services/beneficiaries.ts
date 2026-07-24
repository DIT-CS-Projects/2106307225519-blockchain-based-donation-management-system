import { api } from '@/services/api'

// Contract: api/beneficiaries.md (base path /api/beneficiaries).

export interface Beneficiary {
  id: number
  campaignId: number
  name: string
  description: string
  category: string | null
  location: string | null
  imageUrl: string | null
  verified: boolean
  createdAt: string
}

export interface AdminBeneficiary extends Beneficiary {
  contactInfo: string | null
  verifiedAt: string | null
  verifiedBy: number | null
}

export async function getBeneficiaries(campaignId?: number): Promise<Beneficiary[]> {
  const { data } = await api.get<{ items: Beneficiary[] }>('/beneficiaries', {
    params: campaignId ? { campaignId } : undefined,
  })
  return data.items
}

export async function getBeneficiary(id: number): Promise<Beneficiary> {
  const { data } = await api.get<{ beneficiary: Beneficiary }>(`/beneficiaries/${id}`)
  return data.beneficiary
}

// --- Admin ---

export interface AdminBeneficiaryListParams {
  campaignId?: number
  verified?: boolean
  page?: number
  limit?: number
}

export interface AdminBeneficiaryListResult {
  items: AdminBeneficiary[]
  total: number
  page: number
  limit: number
}

export async function getBeneficiariesAdmin(
  params: AdminBeneficiaryListParams = {},
): Promise<AdminBeneficiaryListResult> {
  const { data } = await api.get<AdminBeneficiaryListResult>('/beneficiaries/admin', { params })
  return data
}

export async function getBeneficiaryAdmin(id: number): Promise<AdminBeneficiary> {
  const { data } = await api.get<{ beneficiary: AdminBeneficiary }>(`/beneficiaries/admin/${id}`)
  return data.beneficiary
}

// --- Owner surface (fundraiser or admin, scoped to a campaign they own) ---

export async function getManagedBeneficiaries(
  campaignId: number,
): Promise<AdminBeneficiaryListResult> {
  const { data } = await api.get<AdminBeneficiaryListResult>('/beneficiaries/manage', {
    params: { campaignId },
  })
  return data
}

export async function getManagedBeneficiary(id: number): Promise<AdminBeneficiary> {
  const { data } = await api.get<{ beneficiary: AdminBeneficiary }>(`/beneficiaries/manage/${id}`)
  return data.beneficiary
}

export interface BeneficiaryFormInput {
  campaignId: number
  name: string
  description: string
  category?: string
  location?: string
  contactInfo?: string
  imageUrl?: string | null
}

export async function createBeneficiary(input: BeneficiaryFormInput): Promise<AdminBeneficiary> {
  const { data } = await api.post<{ beneficiary: AdminBeneficiary }>('/beneficiaries', input)
  return data.beneficiary
}

export async function updateBeneficiary(
  id: number,
  input: Partial<Omit<BeneficiaryFormInput, 'campaignId'>>,
): Promise<AdminBeneficiary> {
  const { data } = await api.put<{ beneficiary: AdminBeneficiary }>(`/beneficiaries/${id}`, input)
  return data.beneficiary
}

export async function setBeneficiaryVerified(id: number, verified: boolean): Promise<AdminBeneficiary> {
  const { data } = await api.patch<{ beneficiary: AdminBeneficiary }>(`/beneficiaries/${id}/verify`, {
    verified,
  })
  return data.beneficiary
}

export async function deleteBeneficiary(id: number): Promise<void> {
  await api.delete(`/beneficiaries/${id}`)
}

export async function uploadBeneficiaryImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post<{ url: string }>('/beneficiaries/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

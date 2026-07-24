import { api } from '@/services/api'
import type { CampaignCategory } from '@/constants/config'
import type { Campaign } from '@/services/campaigns'

// Contract: api/campaigns.md. Campaign management for administrators and, for
// their own campaigns, fundraisers (Decision 020).

export type AdminCampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'rejected'
  | 'completed'
  | 'archived'

export interface AdminCampaign extends Omit<Campaign, 'status'> {
  status: AdminCampaignStatus
  ownerId: number | null
  ownerName: string | null
  rejectionReason: string | null
}

export interface AdminCampaignListParams {
  status?: AdminCampaignStatus
  page?: number
  limit?: number
}

export interface AdminCampaignListResult {
  items: AdminCampaign[]
  total: number
  page: number
  limit: number
}

export async function getCampaignsAdmin(
  params: AdminCampaignListParams = {},
): Promise<AdminCampaignListResult> {
  const { data } = await api.get<AdminCampaignListResult>('/campaigns/admin', { params })
  return data
}

export async function getCampaignAdmin(id: number): Promise<AdminCampaign> {
  const { data } = await api.get<{ campaign: AdminCampaign }>(`/campaigns/admin/${id}`)
  return data.campaign
}

/** Campaigns owned by the signed-in fundraiser/administrator. */
export async function getMyCampaigns(
  params: AdminCampaignListParams = {},
): Promise<AdminCampaignListResult> {
  const { data } = await api.get<AdminCampaignListResult>('/campaigns/mine', { params })
  return data
}

/** Owner-or-admin detail (used by the fundraiser manage view). */
export async function getManagedCampaign(id: number): Promise<AdminCampaign> {
  const { data } = await api.get<{ campaign: AdminCampaign }>(`/campaigns/manage/${id}`)
  return data.campaign
}

export async function submitCampaign(id: number): Promise<AdminCampaign> {
  const { data } = await api.post<{ campaign: AdminCampaign }>(`/campaigns/${id}/submit`)
  return data.campaign
}

export async function approveCampaign(id: number): Promise<AdminCampaign> {
  const { data } = await api.post<{ campaign: AdminCampaign }>(`/campaigns/${id}/approve`)
  return data.campaign
}

export async function rejectCampaign(id: number, reason: string): Promise<AdminCampaign> {
  const { data } = await api.post<{ campaign: AdminCampaign }>(`/campaigns/${id}/reject`, { reason })
  return data.campaign
}

export interface CampaignFormInput {
  title: string
  description: string
  category: CampaignCategory
  imageUrl?: string | null
  targetAmount: number
  startDate: string
  endDate: string
  featured?: boolean
}

export async function createCampaign(input: CampaignFormInput): Promise<AdminCampaign> {
  const { data } = await api.post<{ campaign: AdminCampaign }>('/campaigns', input)
  return data.campaign
}

export async function updateCampaign(
  id: number,
  input: Partial<CampaignFormInput> & { status?: AdminCampaignStatus },
): Promise<AdminCampaign> {
  const { data } = await api.put<{ campaign: AdminCampaign }>(`/campaigns/${id}`, input)
  return data.campaign
}

export async function archiveCampaign(id: number): Promise<AdminCampaign> {
  const { data } = await api.patch<{ campaign: AdminCampaign }>(`/campaigns/${id}/archive`)
  return data.campaign
}

export async function deleteCampaign(id: number): Promise<void> {
  await api.delete(`/campaigns/${id}`)
}

export async function uploadCampaignImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post<{ url: string }>('/campaigns/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

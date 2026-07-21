import { api } from '@/services/api'
import type { CampaignCategory } from '@/constants/config'
import type { Campaign } from '@/services/campaigns'

// Contract: api/campaigns.md. Admin-only campaign management.

export type AdminCampaignStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface AdminCampaign extends Omit<Campaign, 'status'> {
  status: AdminCampaignStatus
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

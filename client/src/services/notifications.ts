import { api } from '@/services/api'

// Contract: api/notifications.md (base path /api/notifications).

export type NotificationType =
  | 'donation_success'
  | 'donation_failed'
  | 'campaign_published'
  | 'campaign_closed'
  | 'campaign_goal_achieved'
  | 'beneficiary_updated'
  | 'password_changed'
  | 'system_announcement'
  | 'disbursement_completed'
  | 'disbursement_failed'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export interface NotificationListResult {
  items: Notification[]
  unreadCount: number
}

export async function getNotifications(): Promise<NotificationListResult> {
  const { data } = await api.get<NotificationListResult>('/notifications')
  return data
}

export async function markRead(id: number): Promise<void> {
  await api.put(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await api.put('/notifications/read-all')
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/notifications/${id}`)
}

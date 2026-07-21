import {
  countUnread,
  deleteNotification,
  findNotificationsByUser,
  insertNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../repositories/notification.repository'
import { findUserById, findUserIdsByRole } from '../repositories/user.repository'
import { getEmailProvider } from './email'
import { logger } from '../utils/logger'
import type { NotificationRow } from '../database/schema'

type NotificationType = NotificationRow['type']

// Events that also send an email (api/notifications.md: "Email (selected events)").
const EMAIL_EVENTS = new Set<NotificationType>([
  'donation_success',
  'password_changed',
  'system_announcement',
])

export interface NotifyInput {
  userIds: number[]
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Create a notification for one or more recipients (write-fanout: one row
 * per recipient, so reads are always a simple per-user query). Selected event
 * types also send email, best-effort — a delivery failure never blocks the
 * triggering action (notifications are a side effect, not the source of
 * truth). Callers invoke this fire-and-forget (`void notify(...)`), so every
 * failure is caught and logged here rather than becoming an unhandled
 * rejection that could crash the process.
 */
export async function notify(input: NotifyInput): Promise<void> {
  if (input.userIds.length === 0) return

  try {
    await insertNotifications(
      input.userIds.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
      })),
    )
  } catch (error) {
    logger.error(`Failed to create '${input.type}' notification:`, error)
    return
  }

  if (!EMAIL_EVENTS.has(input.type)) return

  for (const userId of input.userIds) {
    void sendEmailSafely(userId, input.title, input.message)
  }
}

async function sendEmailSafely(userId: number, subject: string, text: string): Promise<void> {
  try {
    const user = await findUserById(userId)
    if (!user) return
    await getEmailProvider().send({ to: user.email, subject, text })
  } catch (error) {
    logger.error(`Failed to email user ${userId}:`, error)
  }
}

/** Broadcast a system announcement to every administrator. */
export async function notifyAdmins(title: string, message: string, link?: string): Promise<void> {
  const adminIds = await findUserIdsByRole('admin')
  await notify({ userIds: adminIds, type: 'system_announcement', title, message, link })
}

export interface NotificationDto {
  id: number
  type: NotificationType
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export interface NotificationListResult {
  items: NotificationDto[]
  unreadCount: number
}

export async function getNotifications(userId: number): Promise<NotificationListResult> {
  const [rows, unreadCount] = await Promise.all([
    findNotificationsByUser(userId),
    countUnread(userId),
  ])
  return {
    items: rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      link: row.link,
      read: row.read,
      createdAt: row.createdAt.toISOString(),
    })),
    unreadCount,
  }
}

export async function markRead(id: number, userId: number): Promise<void> {
  await markNotificationRead(id, userId)
}

export async function markAllRead(userId: number): Promise<void> {
  await markAllNotificationsRead(userId)
}

export async function removeNotification(id: number, userId: number): Promise<void> {
  await deleteNotification(id, userId)
}

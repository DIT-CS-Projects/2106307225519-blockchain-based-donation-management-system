import { and, count, desc, eq } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { notifications, type NewNotificationRow, type NotificationRow } from '../database/schema'

export async function insertNotifications(rows: NewNotificationRow[]): Promise<void> {
  if (rows.length === 0) return
  const client = requireDb()
  await client.insert(notifications).values(rows)
}

export async function findNotificationsByUser(userId: number): Promise<NotificationRow[]> {
  const client = requireDb()
  return client
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50)
}

export async function countUnread(userId: number): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
  return row?.total ?? 0
}

/** Owner-scoped: only marks the notification if it belongs to this user. */
export async function markNotificationRead(id: number, userId: number): Promise<void> {
  const client = requireDb()
  await client
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  const client = requireDb()
  await client
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
}

/** Owner-scoped delete. */
export async function deleteNotification(id: number, userId: number): Promise<void> {
  const client = requireDb()
  await client
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
}

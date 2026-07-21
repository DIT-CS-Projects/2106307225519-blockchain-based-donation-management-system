import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import * as notificationService from '../services/notification.service'
import { ApiError } from '../utils/ApiError'

function requireUserId(req: Request): number {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return req.user.id
}

const idParamSchema = z.coerce.number().int().positive()

function parseId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('Notification not found')
  return id.data
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await notificationService.getNotifications(requireUserId(req)))
  } catch (error) {
    next(error)
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markRead(parseId(req), requireUserId(req))
    res.json({ message: 'Marked as read' })
  } catch (error) {
    next(error)
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(requireUserId(req))
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.removeNotification(parseId(req), requireUserId(req))
    res.json({ message: 'Notification removed' })
  } catch (error) {
    next(error)
  }
}

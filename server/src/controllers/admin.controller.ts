import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { getDashboard } from '../services/dashboard.service'
import { repairMissingProofs } from '../services/donation.service'
import * as adminUserService from '../services/adminUser.service'
import * as fundraiserApplicationService from '../services/fundraiserApplication.service'
import { listAuditLogs } from '../services/auditLog.service'
import { notify, notifyAdmins } from '../services/notification.service'
import { findUserIdsByRole } from '../repositories/user.repository'
import { AUDIT_ACTIONS, recordAudit } from '../services/auditLog.service'
import { ApiError } from '../utils/ApiError'
import { rejectReasonSchema } from '../validation/fundraiser'

function requireAdminId(req: Request): number {
  if (!req.user) throw ApiError.unauthorized('Authentication required')
  return req.user.id
}

export async function dashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getDashboard())
  } catch (error) {
    next(error)
  }
}

/**
 * Re-record donation proofs missing from the current chain (api/admin.md).
 * Recording needs the contract owner's wallet, which only the server holds, so
 * this repair has to run here rather than from an operator's machine.
 */
export async function repairProofs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = requireAdminId(req)
    const result = await repairMissingProofs()
    void recordAudit({
      userId: adminId,
      action: AUDIT_ACTIONS.blockchainProofRepair,
      entityType: 'blockchain',
      details: { ...result },
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const idParamSchema = z.coerce.number().int().positive()

function parseUserId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('User not found')
  return id.data
}

const listUsersQuerySchema = z.object({
  role: z.enum(['donor', 'fundraiser', 'admin']).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listUsersQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await adminUserService.listUsers(query.data))
  } catch (error) {
    next(error)
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ user: await adminUserService.getUserDetail(parseUserId(req)) })
  } catch (error) {
    next(error)
  }
}

const statusSchema = z.object({ status: z.enum(['active', 'suspended', 'deactivated']) })

export async function updateUserStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = statusSchema.safeParse(req.body)
    if (!parsed.success) throw ApiError.badRequest('Invalid status')
    const user = await adminUserService.updateUserStatus(
      requireAdminId(req),
      parseUserId(req),
      parsed.data.status,
    )
    res.json({ user })
  } catch (error) {
    next(error)
  }
}

// --- Fundraisers (Decision 024) ---

const fundraisersQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function listFundraisers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = fundraisersQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await fundraiserApplicationService.listFundraisers(query.data))
  } catch (error) {
    next(error)
  }
}

function parseApplicationId(req: Request): number {
  const id = idParamSchema.safeParse(req.params.id)
  if (!id.success) throw ApiError.notFound('Application not found')
  return id.data
}

export async function approveFundraiserApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const application = await fundraiserApplicationService.approveApplication(
      requireAdminId(req),
      parseApplicationId(req),
    )
    res.json({ application })
  } catch (error) {
    next(error)
  }
}

export async function rejectFundraiserApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = rejectReasonSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'A reason is required')
    }
    const application = await fundraiserApplicationService.rejectApplication(
      requireAdminId(req),
      parseApplicationId(req),
      parsed.data.reason,
    )
    res.json({ application })
  } catch (error) {
    next(error)
  }
}

const auditQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  action: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
})

export async function audit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = auditQuerySchema.safeParse(req.query)
    if (!query.success) throw ApiError.badRequest('Invalid filters')
    res.json(await listAuditLogs(query.data))
  } catch (error) {
    next(error)
  }
}

const broadcastSchema = z.object({
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(1000),
  audience: z.enum(['admins', 'donors', 'everyone']).default('everyone'),
})

export async function broadcastNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = broadcastSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0]?.message ?? 'Invalid announcement')
    }
    const { title, message, audience } = parsed.data

    if (audience === 'admins') {
      await notifyAdmins(title, message)
    } else {
      const roles = audience === 'everyone' ? (['admin', 'donor'] as const) : (['donor'] as const)
      const userIds = (await Promise.all(roles.map((role) => findUserIdsByRole(role)))).flat()
      await notify({ userIds, type: 'system_announcement', title, message })
    }

    void recordAudit({
      userId: requireAdminId(req),
      action: AUDIT_ACTIONS.notificationBroadcast,
      details: { title, audience },
    })

    res.status(201).json({ message: 'Announcement sent' })
  } catch (error) {
    next(error)
  }
}

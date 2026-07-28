import type { NextFunction, Request, Response } from 'express'
import * as rewardService from '../services/reward.service'
import { ApiError } from '../utils/ApiError'

function requireUserId(req: Request): number {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required')
  }
  return req.user.id
}

/** The signed-in user's Impact Points overview: balance, tier, rules, history. */
export async function overview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await rewardService.getOverview(requireUserId(req)))
  } catch (error) {
    next(error)
  }
}

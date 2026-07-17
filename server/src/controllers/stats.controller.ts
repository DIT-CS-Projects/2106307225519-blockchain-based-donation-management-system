import type { NextFunction, Request, Response } from 'express'
import { getPlatformStats } from '../services/stats.service'

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await getPlatformStats())
  } catch (error) {
    next(error)
  }
}

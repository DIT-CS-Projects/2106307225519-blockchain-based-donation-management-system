import type { Request, Response } from 'express'
import { checkDatabase } from '../config/database'
import { env } from '../config/env'

/** Reports service, database, and runtime health. */
export async function getHealth(_req: Request, res: Response): Promise<void> {
  const databaseConnected = await checkDatabase()

  res.json({
    status: 'ok',
    service: 'changia-server',
    version: '0.1.0',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    database: databaseConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
}

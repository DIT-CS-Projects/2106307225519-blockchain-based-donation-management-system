import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import * as reportService from '../services/report.service'
import { contentTypeFor, extensionFor, toCsv, toExcelBuffer, toPdfBuffer } from '../utils/export'
import type { ReportResult } from '../services/report.service'
import { ApiError } from '../utils/ApiError'

const formatSchema = z.enum(['json', 'csv', 'excel', 'pdf']).default('json')

async function respond(
  res: Response,
  reportName: string,
  reportTitle: string,
  result: ReportResult,
  format: 'json' | 'csv' | 'excel' | 'pdf',
): Promise<void> {
  if (format === 'json') {
    res.json(result)
    return
  }

  const filename = `${reportName}-report.${extensionFor(format)}`
  res.setHeader('Content-Type', contentTypeFor(format))
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  if (format === 'csv') {
    res.send(toCsv(result.columns, result.rows))
  } else if (format === 'excel') {
    res.send(await toExcelBuffer(reportName, result.columns, result.rows))
  } else {
    res.send(await toPdfBuffer(reportTitle, result.columns, result.rows))
  }
}

function parseFormat(req: Request): 'json' | 'csv' | 'excel' | 'pdf' {
  const parsed = formatSchema.safeParse(req.query.format)
  if (!parsed.success) throw ApiError.badRequest('Invalid export format')
  return parsed.data
}

export async function donations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await respond(res, 'donations', 'Donation Report', await reportService.getDonationReport(), parseFormat(req))
  } catch (error) {
    next(error)
  }
}

export async function campaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await respond(res, 'campaigns', 'Campaign Report', await reportService.getCampaignReport(), parseFormat(req))
  } catch (error) {
    next(error)
  }
}

export async function beneficiaries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await respond(
      res,
      'beneficiaries',
      'Beneficiary Report',
      await reportService.getBeneficiaryReport(),
      parseFormat(req),
    )
  } catch (error) {
    next(error)
  }
}

export async function disbursements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await respond(
      res,
      'disbursements',
      'Disbursement Report',
      await reportService.getDisbursementReport(),
      parseFormat(req),
    )
  } catch (error) {
    next(error)
  }
}

export async function blockchain(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await respond(res, 'blockchain', 'Blockchain Report', await reportService.getBlockchainReport(), parseFormat(req))
  } catch (error) {
    next(error)
  }
}

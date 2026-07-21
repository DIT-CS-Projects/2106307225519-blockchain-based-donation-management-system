import { api } from '@/services/api'

// Contract: api/reports.md (base path /api/reports). Admin only.

export type ReportName = 'donations' | 'campaigns' | 'beneficiaries' | 'disbursements' | 'blockchain'
export type ExportFormat = 'csv' | 'excel' | 'pdf'

export interface ReportColumn {
  key: string
  header: string
}

export interface ReportResult {
  summary: Record<string, number | string>
  columns: ReportColumn[]
  rows: Record<string, unknown>[]
}

export async function getReport(name: ReportName): Promise<ReportResult> {
  const { data } = await api.get<ReportResult>(`/reports/${name}`)
  return data
}

const EXTENSION: Record<ExportFormat, string> = { csv: 'csv', excel: 'xlsx', pdf: 'pdf' }

/** Downloads a report export by triggering a browser save via a blob URL. */
export async function downloadReport(name: ReportName, format: ExportFormat): Promise<void> {
  const { data } = await api.get(`/reports/${name}`, {
    params: { format },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}-report.${EXTENSION[format]}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

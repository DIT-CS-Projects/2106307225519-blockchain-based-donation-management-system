import { stringify } from 'csv-stringify/sync'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'

export type ExportFormat = 'csv' | 'excel' | 'pdf'

export interface ExportColumn {
  key: string
  header: string
}

export function toCsv(columns: ExportColumn[], rows: Record<string, unknown>[]): string {
  return stringify(rows, {
    header: true,
    columns: columns.map((c) => ({ key: c.key, header: c.header })),
  })
}

export async function toExcelBuffer(
  sheetName: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: 22 }))
  sheet.getRow(1).font = { bold: true }
  rows.forEach((row) => sheet.addRow(row))
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

/** A simple tabular PDF: title, generated-at timestamp, and a plain grid. */
export function toPdfBuffer(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const left = doc.page.margins.left
    const width = doc.page.width - left - doc.page.margins.right

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A').text(title, left, 40)
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748B')
      .text(`Generated ${new Date().toLocaleString('en-GB')}`, left, 62)

    const colWidth = width / columns.length
    let y = 90

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0F172A')
    columns.forEach((col, i) => {
      doc.text(col.header, left + i * colWidth, y, { width: colWidth - 6 })
    })
    y += 16
    doc.moveTo(left, y).lineTo(left + width, y).strokeColor('#E2E8F0').stroke()
    y += 8

    doc.font('Helvetica').fillColor('#0F172A')
    for (const row of rows) {
      if (y > doc.page.height - 60) {
        doc.addPage()
        y = 40
      }
      columns.forEach((col, i) => {
        const value = row[col.key]
        doc.text(value === null || value === undefined ? '' : String(value), left + i * colWidth, y, {
          width: colWidth - 6,
        })
      })
      y += 16
    }

    doc.end()
  })
}

export function contentTypeFor(format: ExportFormat): string {
  if (format === 'csv') return 'text/csv'
  if (format === 'excel') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return 'application/pdf'
}

export function extensionFor(format: ExportFormat): string {
  if (format === 'excel') return 'xlsx'
  return format
}

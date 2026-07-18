import PDFDocument from 'pdfkit'
import type { DonationDetailRow } from '../repositories/donation.repository'

// Brand name for receipts (docs/PROJECT_OVERVIEW.md).
const BRAND = 'Changia'
const INK = '#0F172A'
const MUTED = '#64748B'
const ACCENT = '#0D9488'
const LINE = '#E2E8F0'

function formatTZS(amount: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const PROOF_LABEL: Record<string, string> = {
  pending: 'Pending — being recorded on the blockchain',
  confirmed: 'Confirmed on the blockchain',
  failed: 'Not recorded',
}

/**
 * Render a branded PDF receipt for a donation and resolve with the bytes. Uses
 * pdfkit's built-in fonts so no font assets are needed. Contract:
 * api/donations.md (GET /api/donations/:id/receipt).
 */
export function renderReceiptPdf(donation: DonationDetailRow): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const width = right - left

    // Header
    doc.fillColor(ACCENT).fontSize(22).font('Helvetica-Bold').text(BRAND, left, 56)
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .font('Helvetica')
      .text('Transparent giving, verified forever.', left, 82)
    doc
      .fillColor(INK)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Donation Receipt', left, 56, { width, align: 'right' })
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .font('Helvetica')
      .text(`No. ${donation.receiptNumber}`, left, 78, { width, align: 'right' })

    doc.moveTo(left, 112).lineTo(right, 112).strokeColor(LINE).stroke()

    // Amount highlight
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('Amount donated', left, 132)
    doc.fillColor(INK).fontSize(28).font('Helvetica-Bold').text(formatTZS(donation.amount), left, 146)
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .font('Helvetica')
      .text(`Issued ${formatDate(donation.createdAt)}`, left, 150, { width, align: 'right' })

    // Detail rows
    const rows: [string, string][] = [
      ['Donor', donation.donorName],
      ['Email', donation.donorEmail],
      ['Campaign', donation.campaignTitle],
      ['Payment reference', donation.paymentReference],
      ['Receipt number', donation.receiptNumber],
      ['Blockchain proof', PROOF_LABEL[donation.proofStatus ?? 'pending'] ?? 'Pending'],
    ]
    if (donation.txHash) rows.push(['Transaction hash', donation.txHash])

    let y = 200
    for (const [label, value] of rows) {
      doc.fillColor(MUTED).fontSize(10).font('Helvetica').text(label, left, y, { width: 150 })
      doc
        .fillColor(INK)
        .fontSize(11)
        .font('Helvetica')
        .text(value, left + 160, y, { width: width - 160 })
      y = doc.y + 12
      doc.moveTo(left, y - 6).lineTo(right, y - 6).strokeColor(LINE).stroke()
    }

    // Footer
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Thank you for supporting ${donation.campaignTitle} through ${BRAND}. This receipt confirms a completed donation. Once its blockchain proof is confirmed, anyone can verify it independently.`,
        left,
        760,
        { width, align: 'center' },
      )

    doc.end()
  })
}

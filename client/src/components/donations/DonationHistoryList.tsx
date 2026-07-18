import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { VerificationBadge } from '@/components/donations/VerificationBadge'
import { ReceiptButton } from '@/components/donations/ReceiptButton'
import type { Donation } from '@/services/donations'
import { campaignDetailsPath, donationDetailsPath } from '@/constants/routes'
import { formatDate, formatTZS } from '@/utils/format'

/** A donor's donation history: a table on wider screens, stacked cards on mobile. */
export function DonationHistoryList({ donations }: { donations: Donation[] }) {
  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {donations.map((donation) => (
          <li key={donation.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={campaignDetailsPath(donation.campaignId)}
                className="font-medium leading-snug hover:underline"
              >
                {donation.campaignTitle}
              </Link>
              <span className="shrink-0 font-display font-semibold tabular-nums">
                {formatTZS(donation.amount)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{formatDate(donation.createdAt)}</span>
              <VerificationBadge status={donation.blockchain.status} />
            </div>
            <div className="mt-3 flex items-center gap-4">
              <Link
                to={donationDetailsPath(donation.id)}
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
              <ReceiptButton
                donationId={donation.id}
                receiptNumber={donation.receiptNumber}
                variant="ghost"
                size="sm"
                label="Receipt"
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="px-4 py-3 font-medium">Campaign</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
              <th scope="col" className="px-4 py-3 font-medium">Proof</th>
              <th scope="col" className="px-4 py-3 font-medium">Receipt</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(donation.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={campaignDetailsPath(donation.campaignId)}
                    className="font-medium hover:underline"
                  >
                    {donation.campaignTitle}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                  {formatTZS(donation.amount)}
                </td>
                <td className="px-4 py-3">
                  <VerificationBadge status={donation.blockchain.status} />
                </td>
                <td className="px-4 py-3">
                  <ReceiptButton
                    donationId={donation.id}
                    receiptNumber={donation.receiptNumber}
                    variant="ghost"
                    size="sm"
                    label="Download"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={donationDetailsPath(donation.id)}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    View
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

import { Link } from 'react-router-dom'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import type { Donation } from '@/services/donations'
import { campaignDetailsPath } from '@/constants/routes'
import { formatTZS } from '@/utils/format'

interface SupportedCampaign {
  campaignId: number
  campaignTitle: string
  total: number
  count: number
  verifiedCount: number
}

/** Roll a donor's flat donation history up into one entry per campaign, newest first. */
function groupByCampaign(donations: Donation[]): SupportedCampaign[] {
  const byId = new Map<number, SupportedCampaign>()
  for (const d of donations) {
    const existing = byId.get(d.campaignId)
    if (existing) {
      existing.total += d.amount
      existing.count += 1
      if (d.blockchain.status === 'confirmed') existing.verifiedCount += 1
    } else {
      byId.set(d.campaignId, {
        campaignId: d.campaignId,
        campaignTitle: d.campaignTitle,
        total: d.amount,
        count: 1,
        verifiedCount: d.blockchain.status === 'confirmed' ? 1 : 0,
      })
    }
  }
  // History arrives newest-first, so insertion order already reflects recency.
  return [...byId.values()]
}

/** Cards summarizing each campaign a donor has given to, with their running total. */
export function SupportedCampaigns({ donations }: { donations: Donation[] }) {
  const campaigns = groupByCampaign(donations)

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {campaigns.map((c) => (
        <li key={c.campaignId}>
          <Link
            to={campaignDetailsPath(c.campaignId)}
            className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium leading-snug group-hover:text-primary">
                {c.campaignTitle}
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold tabular-nums">
              {formatTZS(c.total)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {c.count} {c.count === 1 ? 'donation' : 'donations'}
              </span>
              {c.verifiedCount > 0 && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  {c.verifiedCount} verified
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

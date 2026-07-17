import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { campaignDetailsPath } from '@/constants/routes'
import { daysRemaining, formatTZS, fundingPercent } from '@/utils/format'
import type { Campaign } from '@/services/campaigns'

/**
 * Campaign summary card. The whole card is one link (Flat-At-Rest:
 * shadow appears on hover only because the card is interactive).
 */
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const percent = fundingPercent(campaign.raisedAmount, campaign.targetAmount)
  const days = daysRemaining(campaign.endDate)

  return (
    <Link
      to={campaignDetailsPath(campaign.id)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {campaign.imageUrl ? (
        <img
          src={campaign.imageUrl}
          alt=""
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-muted text-muted-foreground">
          <ImageOff className="size-6" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-6">
        <span className="self-start rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {campaign.category}
        </span>

        <h3 className="font-display text-2xl font-semibold leading-snug text-card-foreground">
          {campaign.title}
        </h3>

        <div className="mt-auto flex flex-col gap-2">
          <ProgressBar value={percent} aria-label={`${percent}% funded`} />
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold tabular-nums text-card-foreground">
              {formatTZS(campaign.raisedAmount)}
            </span>
            <span className="tabular-nums text-muted-foreground">{percent}% funded</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {days === 0 ? 'Ended' : `${days} day${days === 1 ? '' : 's'} left`}
            </span>
            <span className="font-medium text-primary group-hover:underline">Donate</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Loading placeholder matching CampaignCard's layout. */
export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

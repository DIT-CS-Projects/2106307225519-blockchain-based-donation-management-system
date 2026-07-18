import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { CampaignCard } from '@/components/cards/CampaignCard'
import { DonationWidget } from '@/components/campaigns/DonationWidget'
import { VerificationPanel } from '@/components/campaigns/VerificationPanel'
import { useFetch } from '@/hooks/useFetch'
import { getCampaignDetails } from '@/services/campaigns'
import { ROUTES } from '@/constants/routes'
import { daysRemaining, formatTZS, fundingPercent } from '@/utils/format'

export function CampaignDetailsPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const donateParam = Number(searchParams.get('donate'))
  const initialAmount = Number.isFinite(donateParam) && donateParam > 0 ? donateParam : undefined
  const fetcher = useCallback(() => getCampaignDetails(id), [id])
  const { data, error, loading, retry } = useFetch(fetcher)

  if (loading) return <CampaignDetailsSkeleton />

  if (error) {
    const notFound = error.status === 404
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">
          {notFound ? 'Campaign not found' : "This campaign couldn't be loaded"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {notFound
            ? 'It may have been archived or the link is incorrect.'
            : 'Check your connection and try again. Nothing is lost.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {!notFound && (
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          )}
          <Button asChild>
            <Link to={ROUTES.campaigns}>Browse campaigns</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { campaign, relatedCampaigns } = data
  const percent = fundingPercent(campaign.raisedAmount, campaign.targetAmount)
  const days = daysRemaining(campaign.endDate)

  return (
    <article>
      {campaign.imageUrl && (
        <div className="h-64 w-full overflow-hidden border-b border-border sm:h-80 lg:h-96">
          <img src={campaign.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <Link
          to={ROUTES.campaigns}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All campaigns
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div className="min-w-0">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {campaign.category}
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance">
              {campaign.title}
            </h1>

            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-display text-3xl font-semibold tabular-nums">
                  {formatTZS(campaign.raisedAmount)}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {formatTZS(campaign.targetAmount)}
                </span>
              </div>
              <ProgressBar value={percent} aria-label={`${percent}% funded`} className="mt-4" />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium tabular-nums text-foreground">{percent}% funded</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="size-4" aria-hidden="true" />
                  {days === 0 ? 'Ended' : `${days} day${days === 1 ? '' : 's'} left`}
                </span>
              </div>
            </div>

            <div className="mt-10 max-w-prose">
              <h2 className="font-display text-2xl font-semibold">About this campaign</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                {campaign.description}
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <DonationWidget
              campaignId={campaign.id}
              canDonate={campaign.status === 'active'}
              initialAmount={initialAmount}
            />
            <VerificationPanel />
          </aside>
        </div>

        {relatedCampaigns.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20 border-t border-border pt-12">
            <h2 id="related-heading" className="font-display text-2xl font-semibold">
              Related campaigns
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCampaigns.map((related) => (
                <CampaignCard key={related.id} campaign={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

function CampaignDetailsSkeleton() {
  return (
    <div>
      <Skeleton className="h-64 w-full rounded-none sm:h-80 lg:h-96" />
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="mt-4 h-10 w-3/4" />
            <Skeleton className="mt-8 h-36 w-full" />
            <Skeleton className="mt-10 h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-2/3" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  )
}

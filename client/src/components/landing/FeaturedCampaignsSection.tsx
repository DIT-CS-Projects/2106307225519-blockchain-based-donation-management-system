import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CampaignCard, CampaignCardSkeleton } from '@/components/cards/CampaignCard'
import { Reveal } from '@/components/shared/Reveal'
import { useFetch } from '@/hooks/useFetch'
import { getFeaturedCampaigns } from '@/services/campaigns'
import { ROUTES } from '@/constants/routes'

const SKELETON_COUNT = 3

export function FeaturedCampaignsSection() {
  const { data, error, loading, retry } = useFetch(getFeaturedCampaigns)

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold">Featured campaigns</h2>
          <Link
            to={ROUTES.campaigns}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all campaigns
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10">
          {loading && (
            <div role="status" aria-label="Loading campaigns" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div role="status" className="rounded-lg border border-border bg-background px-6 py-12 text-center">
              <p className="font-medium">Campaigns couldn't be loaded.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your connection and try again. Nothing is lost.
              </p>
              <Button variant="secondary" onClick={retry} className="mt-6">
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && data && data.length === 0 && (
            <div className="rounded-lg border border-border bg-background px-6 py-12 text-center">
              <p className="font-medium">No campaigns available yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verified campaigns appear here as NGOs publish them.
              </p>
            </div>
          )}

          {!loading && !error && data && data.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((campaign) => (
                <Reveal key={campaign.id}>
                  <CampaignCard campaign={campaign} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

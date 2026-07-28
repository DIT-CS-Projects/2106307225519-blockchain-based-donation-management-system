import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Award, Compass, HandCoins, Sparkles, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GradientHeader, Stagger, StaggerItem } from '@/components/shared/motion'
import { useFetch } from '@/hooks/useFetch'
import { getRewards, type RewardEvent, type RewardsOverview } from '@/services/rewards'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/utils/format'

const EVENT_ICON: Record<RewardEvent['type'], LucideIcon> = {
  donation: HandCoins,
  first_donation: Sparkles,
  new_campaign: Compass,
}

const formatPoints = (n: number) => n.toLocaleString('en-US')

export function RewardsPage() {
  const { data, error, loading, retry } = useFetch(useCallback(() => getRewards(), []))

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      <GradientHeader>
        <p className="text-sm font-medium text-primary">Rewards</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Your Impact Points</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Earn points every time you give. The more campaigns you support, the higher your tier.
        </p>
      </GradientHeader>

      {loading && <RewardsSkeleton />}

      {!loading && error && (
        <div className="mt-12 rounded-lg border border-border bg-card p-10 text-center">
          <h2 className="font-display text-xl font-semibold">We couldn&apos;t load your rewards</h2>
          <p className="mt-2 text-muted-foreground">Check your connection and try again.</p>
          <Button variant="secondary" className="mt-6" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && <RewardsContent data={data} />}
    </div>
  )
}

function RewardsContent({ data }: { data: RewardsOverview }) {
  return (
    <>
      <BalanceCard data={data} />

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">How to earn</h2>
        <Stagger className="mt-4 grid gap-3 sm:grid-cols-3">
          <StaggerItem>
            <EarnCard
              icon={HandCoins}
              title={`${data.rules.basePer1000} point per 1,000 TZS`}
              body={`Every donation earns points, with a minimum of ${data.rules.minPerDonation} per gift.`}
            />
          </StaggerItem>
          <StaggerItem>
            <EarnCard
              icon={Sparkles}
              title={`+${data.rules.firstDonation} first donation`}
              body="A one-time welcome bonus the first time you give."
            />
          </StaggerItem>
          <StaggerItem>
            <EarnCard
              icon={Compass}
              title={`+${data.rules.newCampaign} new campaign`}
              body="A bonus each time you support a campaign you haven't backed before."
            />
          </StaggerItem>
        </Stagger>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">History</h2>
        {data.events.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <p className="font-medium">No points yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Make your first donation to start earning Impact Points.
            </p>
            <Button asChild className="mt-6">
              <Link to={ROUTES.campaigns}>Browse campaigns</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {data.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function BalanceCard({ data }: { data: RewardsOverview }) {
  const { balance, tier, nextTier } = data
  const toNext = nextTier ? nextTier.pointsNeeded : 0
  const span = balance - tier.min + toNext
  const pct = span > 0 ? Math.round(((balance - tier.min) / span) * 100) : 100

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="mt-1 font-display text-5xl font-bold tabular-nums">{formatPoints(balance)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{data.pointsLabel}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
          <Trophy className="size-4" aria-hidden="true" />
          {tier.name} tier
        </span>
      </div>

      {nextTier ? (
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {formatPoints(nextTier.pointsNeeded)} points to {nextTier.name}
            </span>
            <span className="text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress to ${nextTier.name} tier`}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <Award className="size-4" aria-hidden="true" />
          You&apos;ve reached the top tier. Thank you for your generosity.
        </p>
      )}
    </div>
  )
}

function EarnCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function EventRow({ event }: { event: RewardEvent }) {
  const Icon = EVENT_ICON[event.type]
  return (
    <li className="flex items-center gap-4 px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{event.description}</p>
        <p className="text-sm text-muted-foreground">{formatDate(event.createdAt)}</p>
      </div>
      <span className="shrink-0 font-display font-semibold tabular-nums text-primary">
        +{formatPoints(event.points)}
      </span>
    </li>
  )
}

function RewardsSkeleton() {
  return (
    <div>
      <Skeleton className="mt-8 h-44 w-full rounded-2xl" />
      <Skeleton className="mt-10 h-6 w-32" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="mt-10 h-64 w-full" />
    </div>
  )
}

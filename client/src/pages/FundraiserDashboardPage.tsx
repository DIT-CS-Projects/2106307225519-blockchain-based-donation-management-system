import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Clock, HandCoins, Megaphone, Plus, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProgressBar } from '@/components/ui/progress'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge, campaignStatusTone } from '@/components/shared/StatusBadge'
import { GradientHeader, Stagger, StaggerItem } from '@/components/shared/motion'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { getMyCampaigns } from '@/services/adminCampaigns'
import { getFundraiserApplication, type FundraiserApplicationStatus } from '@/services/auth'
import {
  ROUTES,
  fundraiserCampaignManagePath,
} from '@/constants/routes'
import { formatTZS } from '@/utils/format'

/**
 * A fundraiser's home: the campaigns they own and a way to start a new one.
 * A fundraiser account must be approved by an administrator first (Decision
 * 023); until then the dashboard is locked. Administrators are never gated.
 */
export function FundraiserDashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const application = useFetch(useCallback(() => getFundraiserApplication(), []))
  const { data, loading, error, retry } = useFetch(
    useCallback(() => getMyCampaigns({ limit: 50 }), []),
  )

  const approved = isAdmin || application.data?.status === 'approved'

  if (!isAdmin && application.loading) {
    return (
      <section className="mx-auto max-w-5xl">
        <Skeleton className="h-64 w-full" />
      </section>
    )
  }

  if (!approved) {
    return (
      <FundraiserGate
        status={application.data?.status ?? 'pending'}
        reason={application.data?.decisionReason ?? null}
      />
    )
  }

  return (
    <section className="mx-auto max-w-5xl">
      <GradientHeader>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Fundraiser</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Your campaigns</h1>
            <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
              Create campaigns, add beneficiaries, and release payouts. New campaigns go live after an
              administrator reviews them.
            </p>
          </div>
          <Button asChild>
            <Link to={ROUTES.fundraiserCampaignNew}>
              <Plus aria-hidden="true" /> New campaign
            </Link>
          </Button>
        </div>
      </GradientHeader>

      {loading && <Skeleton className="mt-10 h-64 w-full" />}

      {!loading && error && (
        <div className="mt-10 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load your campaigns.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-10">
          {data.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">You have not created any campaigns yet.</p>
              <Button asChild className="mt-4">
                <Link to={ROUTES.fundraiserCampaignNew}>Create your first campaign</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={HandCoins}
                  label="Total raised"
                  value={formatTZS(data.items.reduce((sum, c) => sum + c.raisedAmount, 0))}
                  hint="Across all your campaigns"
                />
                <StatCard
                  icon={Megaphone}
                  label="Active campaigns"
                  value={String(data.items.filter((c) => c.status === 'active').length)}
                  hint="Live and accepting donations"
                />
                <StatCard
                  icon={Clock}
                  label="Awaiting review"
                  value={String(data.items.filter((c) => c.status === 'pending_review').length)}
                  hint="Pending administrator approval"
                />
              </div>
              <Stagger className="grid gap-4">
              {data.items.map((c) => {
                const pct = c.targetAmount > 0 ? Math.min(100, (c.raisedAmount / c.targetAmount) * 100) : 0
                return (
                  <StaggerItem key={c.id}>
                    <Link
                      to={fundraiserCampaignManagePath(c.id)}
                      className="block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-lg font-semibold">{c.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{c.category}</p>
                        </div>
                        <StatusBadge label={c.status} tone={campaignStatusTone(c.status)} />
                      </div>
                      {c.status === 'rejected' && c.rejectionReason && (
                        <p className="mt-3 text-sm text-destructive">Reason: {c.rejectionReason}</p>
                      )}
                      <div className="mt-4">
                        <ProgressBar value={pct} />
                        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                          <span>{formatTZS(c.raisedAmount)} raised</span>
                          <span>of {formatTZS(c.targetAmount)}</span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                )
              })}
              </Stagger>
            </>
          )}
        </div>
      )}
    </section>
  )
}

/** Locked state shown while a fundraiser account is pending or was rejected. */
function FundraiserGate({
  status,
  reason,
}: {
  status: FundraiserApplicationStatus
  reason: string | null
}) {
  const rejected = status === 'rejected'
  return (
    <section className="mx-auto max-w-2xl">
      <GradientHeader>
        <p className="text-sm font-medium text-primary">Fundraiser</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {rejected ? 'Account not approved' : 'Account under review'}
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {rejected
            ? 'An administrator did not approve your fundraiser account.'
            : 'Thanks for signing up. An administrator is reviewing your fundraiser account. You can create campaigns once it is approved.'}
        </p>
      </GradientHeader>

      <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {rejected ? (
              <ShieldAlert className="size-5" aria-hidden="true" />
            ) : (
              <Clock className="size-5" aria-hidden="true" />
            )}
          </span>
          <StatusBadge
            label={rejected ? 'not approved' : 'under review'}
            tone={rejected ? 'danger' : 'warning'}
          />
        </div>
        {rejected && reason && (
          <p className="mt-4 text-sm text-muted-foreground">Reason: {reason}</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {rejected
            ? 'Contact support if you believe this is a mistake.'
            : 'We will notify you as soon as a decision is made.'}
        </p>
      </div>
    </section>
  )
}

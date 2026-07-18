import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, HandCoins, Heart, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/shared/StatCard'
import { DonationHistoryList } from '@/components/donations/DonationHistoryList'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { getDonationHistory, getDonationSummary } from '@/services/donations'
import { ROUTES } from '@/constants/routes'
import { formatTZS } from '@/utils/format'

export function DonationsPage() {
  const { user } = useAuth()
  const fetcher = useCallback(async () => {
    const [summary, donations] = await Promise.all([
      getDonationSummary(),
      getDonationHistory(),
    ])
    return { summary, donations }
  }, [])
  const { data, error, loading, retry } = useFetch(fetcher)

  const firstName = user?.fullName?.split(' ')[0]

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      <header>
        <h1 className="font-display text-3xl font-bold">
          Your donations{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every donation you make, with its receipt and blockchain proof.
        </p>
      </header>

      {loading && <DonationsSkeleton />}

      {!loading && error && (
        <div className="mt-12 rounded-lg border border-border bg-card p-10 text-center">
          <h2 className="font-display text-xl font-semibold">We couldn&apos;t load your donations</h2>
          <p className="mt-2 text-muted-foreground">Check your connection and try again.</p>
          <Button variant="secondary" className="mt-6" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={HandCoins}
              label="Total donated"
              value={formatTZS(data.summary.totalDonated)}
            />
            <StatCard
              icon={Heart}
              label="Campaigns supported"
              value={String(data.summary.campaignsSupported)}
            />
            <StatCard
              icon={Receipt}
              label="Donations"
              value={String(data.summary.donationCount)}
            />
            <StatCard
              icon={BadgeCheck}
              label="Verified"
              value={String(data.summary.verifiedCount)}
              hint="Confirmed on-chain"
            />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">History</h2>
            {data.donations.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-card p-10 text-center">
                <p className="font-medium">No donations yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  When you support a campaign, it will appear here.
                </p>
                <Button asChild className="mt-6">
                  <Link to={ROUTES.campaigns}>Browse campaigns</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <DonationHistoryList donations={data.donations} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function DonationsSkeleton() {
  return (
    <div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="mt-10 h-6 w-32" />
      <Skeleton className="mt-4 h-64 w-full" />
    </div>
  )
}

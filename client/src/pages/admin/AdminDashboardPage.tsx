import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BadgeCheck, ClipboardCheck, HandCoins, Heart, LayoutGrid, Users, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProgressBar } from '@/components/ui/progress'
import { StatCard } from '@/components/shared/StatCard'
import { useFetch } from '@/hooks/useFetch'
import { getDashboard } from '@/services/admin'
import { campaignDetailsPath, donationDetailsPath, ROUTES } from '@/constants/routes'
import { formatDate, formatTZS, fundingPercent } from '@/utils/format'

const CHART_COLOR = '#0D9488'

export function AdminDashboardPage() {
  const { data, error, loading, retry } = useFetch(getDashboard)

  if (loading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <h1 className="font-display text-xl font-semibold">Dashboard unavailable</h1>
        <p className="mt-2 text-muted-foreground">Check your connection and try again.</p>
        <Button variant="secondary" className="mt-6" onClick={retry}>
          Try again
        </Button>
      </div>
    )
  }

  const { stats, recentDonations, campaignOverview, charts, pendingReviews } = data

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>

      {pendingReviews && pendingReviews.total > 0 && (
        <Link
          to={ROUTES.adminReviews}
          className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ClipboardCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium">{pendingReviews.total} awaiting your review</p>
              <p className="text-sm text-muted-foreground">
                {pendingReviews.fundraiserApplications} fundraiser
                {pendingReviews.fundraiserApplications === 1 ? '' : 's'} · {pendingReviews.campaigns}{' '}
                campaign{pendingReviews.campaigns === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-primary">Review now</span>
        </Link>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={HandCoins} label="Total donations" value={String(stats.totalDonations)} />
        <StatCard icon={Wallet} label="Total revenue" value={formatTZS(stats.totalRevenue)} />
        <StatCard icon={LayoutGrid} label="Active campaigns" value={String(stats.activeCampaigns)} />
        <StatCard icon={Heart} label="Beneficiaries" value={String(stats.beneficiaries)} />
        <StatCard icon={Users} label="Registered users" value={String(stats.registeredUsers)} />
        <StatCard icon={BadgeCheck} label="Chain transactions" value={String(stats.blockchainTransactions)} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Donation trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.donationTrend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => new Intl.NumberFormat('en-TZ', { notation: 'compact' }).format(v)}
                />
                <Tooltip formatter={(value) => formatTZS(Number(value))} />
                <Area type="monotone" dataKey="total" stroke={CHART_COLOR} fill="url(#trendFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Payment methods</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.paymentMethods}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="method" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => new Intl.NumberFormat('en-TZ', { notation: 'compact' }).format(v)}
                />
                <Tooltip formatter={(value) => formatTZS(Number(value))} />
                <Bar dataKey="total" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent donations</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.adminReports}>View reports</Link>
          </Button>
        </div>
        {recentDonations.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No activity available.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Donor</th>
                  <th scope="col" className="px-4 py-3 font-medium">Campaign</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
                  <th scope="col" className="px-4 py-3 font-medium">Chain status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{d.donor}</td>
                    <td className="px-4 py-3">{d.campaign}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatTZS(d.amount)}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{d.blockchainStatus}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <Link to={donationDetailsPath(d.id)} className="hover:underline">
                        {formatDate(d.createdAt)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Active campaigns</h2>
        {campaignOverview.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active campaigns.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaignOverview.map((c) => {
              const percent = fundingPercent(c.raisedAmount, c.targetAmount)
              return (
                <Link
                  key={c.id}
                  to={campaignDetailsPath(c.id)}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <h3 className="line-clamp-1 font-medium">{c.title}</h3>
                  <ProgressBar value={percent} className="mt-3" aria-label={`${percent}% funded`} />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTZS(c.raisedAmount)}</span>
                    <span>{percent}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  )
}

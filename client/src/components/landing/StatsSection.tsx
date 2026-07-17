import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useFetch } from '@/hooks/useFetch'
import { getPlatformStats, type PlatformStats } from '@/services/stats'
import { formatTZS } from '@/utils/format'

function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduceMotion = useReducedMotion()
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    if (!inView || reduceMotion) return
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (latest) => setAnimated(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value])

  const display = reduceMotion ? value : animated

  return (
    <span ref={ref} className="tabular-nums">
      {format(display)}
    </span>
  )
}

const formatCount = (n: number) => new Intl.NumberFormat('en-TZ').format(n)

function statItems(stats: PlatformStats) {
  return [
    { label: 'Donated', value: stats.totalDonationsTZS, format: formatTZS },
    { label: 'Campaigns', value: stats.totalCampaigns, format: formatCount },
    { label: 'People helped', value: stats.peopleHelped, format: formatCount },
    { label: 'Verified donations', value: stats.verifiedDonations, format: formatCount },
  ]
}

/**
 * Real platform totals from GET /stats. Pre-launch (or on failure) the
 * section renders nothing. Changia never shows fabricated numbers.
 */
export function StatsSection() {
  const { data } = useFetch(getPlatformStats)

  if (!data || data.verifiedDonations === 0) return null

  return (
    <section aria-label="Platform totals" className="border-y border-border bg-surface">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 py-14 lg:grid-cols-4">
        {statItems(data).map((item) => (
          <div key={item.label} className="flex flex-col gap-1 lg:items-center">
            <dt className="order-2 text-sm text-muted-foreground">{item.label}</dt>
            <dd className="order-1 font-display text-3xl font-semibold">
              <CountUp value={item.value} format={item.format} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

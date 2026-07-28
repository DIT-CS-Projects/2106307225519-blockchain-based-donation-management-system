import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  className?: string
}

/**
 * A single summary metric: a tinted icon chip, a prominent value, and a label.
 * Never a link, so it stays flat at rest with no hover lift (the elevation
 * system reserves that for interactive cards; a static tile that visually
 * promises a click it doesn't deliver is an invented affordance).
 */
export function StatCard({ icon: Icon, label, value, hint, className }: StatCardProps) {
  return (
    <div className={cn('min-w-0 rounded-xl border border-border bg-card p-5', className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 truncate font-display text-xl font-semibold tabular-nums sm:text-2xl" title={value}>
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  )
}

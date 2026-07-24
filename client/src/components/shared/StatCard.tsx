import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  className?: string
}

/** A single summary metric: a tinted icon chip, a prominent value, and a label. */
export function StatCard({ icon: Icon, label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm',
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  )
}

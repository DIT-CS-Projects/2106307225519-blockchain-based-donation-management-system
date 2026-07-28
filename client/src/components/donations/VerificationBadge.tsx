import { BadgeCheck, Clock, TriangleAlert } from 'lucide-react'
import type { ProofStatus } from '@/services/donations'
import { cn } from '@/lib/utils'

const CONFIG: Record<
  ProofStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: 'Proof pending',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
  confirmed: {
    label: 'Verified on-chain',
    icon: BadgeCheck,
    className: 'bg-secondary text-secondary-foreground',
  },
  failed: {
    label: 'Proof failed',
    icon: TriangleAlert,
    className: 'bg-destructive/10 text-destructive',
  },
}

/** A pill reflecting a donation's blockchain proof status. */
export function VerificationBadge({
  status,
  className,
}: {
  status: ProofStatus
  className?: string
}) {
  const { label, icon: Icon, className: tone } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

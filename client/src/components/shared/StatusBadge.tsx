import { cn } from '@/lib/utils'

// Muted, theme-aware pill for a campaign / application / disbursement status.
const TONES: Record<string, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-destructive/10 text-destructive',
}

export type StatusTone = keyof typeof TONES

interface StatusBadgeProps {
  label: string
  tone?: StatusTone
  className?: string
}

export function StatusBadge({ label, tone = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        TONES[tone],
        className,
      )}
    >
      {label.replace(/_/g, ' ')}
    </span>
  )
}

/** Tone mapping for the campaign status lifecycle (Decision 020). */
export function campaignStatusTone(status: string): StatusTone {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending_review':
      return 'warning'
    case 'rejected':
      return 'danger'
    case 'completed':
      return 'info'
    default:
      return 'neutral'
  }
}

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  /** Percentage, 0–100. */
  value: number
  className?: string
  'aria-label'?: string
}

/** Shared funding progress bar — Harbor Teal fill on a muted track. */
export function ProgressBar({ value, className, ...aria }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      {...aria}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </div>
  )
}

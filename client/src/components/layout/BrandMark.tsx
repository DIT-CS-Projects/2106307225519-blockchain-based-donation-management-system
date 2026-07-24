import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** The ChangiaTanzania mark: a teal tile with a verification check (mirrors the favicon). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-sm',
        className,
      )}
    >
      <Check className="size-4" strokeWidth={3} />
    </span>
  )
}

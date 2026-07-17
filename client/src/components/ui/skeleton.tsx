import { cn } from '@/lib/utils'

/** Shared skeleton loader block. Pulses only when motion is allowed. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)} />
  )
}

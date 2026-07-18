import { Loader2 } from 'lucide-react'

/** Centered spinner for route-level and page-level loading states. */
export function LoadingScreen({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

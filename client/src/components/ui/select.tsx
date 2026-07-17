import type * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Shared native select — accessible, light, styled to match Input. */
function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-md border border-input bg-surface pl-3 pr-9 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  )
}

export { Select }

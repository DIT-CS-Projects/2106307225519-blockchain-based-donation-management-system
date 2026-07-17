import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
}

/**
 * Scroll reveal as progressive enhancement. Content is fully visible by
 * default; browsers supporting CSS scroll-driven animations (and users who
 * allow motion) get a fade-up as the element enters the viewport. Visibility
 * is never gated on a JS-triggered animation. Styles live in index.css.
 */
export function Reveal({ children, className }: RevealProps) {
  return <div className={cn('reveal', className)}>{children}</div>
}

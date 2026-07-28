import type { ReactNode } from 'react'
import { m, useReducedMotion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

// Shared motion primitives. All use framer-motion's lightweight `m` components
// (the app wraps everything in <LazyMotion features={domAnimation} strict>).
// Every helper degrades to a plain element when the user prefers reduced motion.

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
}

interface MotionProps {
  children: ReactNode
  className?: string
}

/** Staggers the entrance of its StaggerItem children as they mount. */
export function Stagger({ children, className }: MotionProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <m.div className={className} variants={containerVariants} initial="hidden" animate="show">
      {children}
    </m.div>
  )
}

/** A single item inside a Stagger container: fades and rises into place. */
export function StaggerItem({ children, className }: MotionProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <m.div className={className} variants={itemVariants}>
      {children}
    </m.div>
  )
}

/** Standalone fade-and-rise on mount, for a single hero/header block. */
export function FadeInUp({ children, className, delay = 0 }: MotionProps & { delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
    >
      {children}
    </m.div>
  )
}

/**
 * A teal gradient wash used behind page headers. Kept single-hue (Harbor Teal
 * only, both blooms): mixing in Signal Coral here read as a muddy pastel in
 * light mode and pulls warmth into the page canvas, which the design system
 * reserves for rare human moments, not ambient decoration (Cool Page / One
 * Coral rules). Flat at rest per the elevation system: this block never becomes
 * interactive, so it never carries a shadow.
 */
export function GradientHeader({ children, className }: MotionProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/10 via-card to-primary/10 p-8 sm:p-10',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-20 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-8 size-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

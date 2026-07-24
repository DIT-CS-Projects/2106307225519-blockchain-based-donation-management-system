import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/**
 * Animates the transition between public pages: the outgoing page fades out and
 * the incoming one fades and rises into place. Keyed on pathname so filter/query
 * changes on the same page do not re-trigger. No animation on the first load
 * (initial=false) or when the user prefers reduced motion.
 */
export function RouteTransition() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <Outlet />

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.26, ease: EASE_OUT }}
      >
        <Outlet />
      </m.div>
    </AnimatePresence>
  )
}

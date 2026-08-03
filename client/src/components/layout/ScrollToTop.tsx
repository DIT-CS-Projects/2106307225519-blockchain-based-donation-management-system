import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Jump straight to the top. Base styles enable smooth scrolling, which would
 * animate the jump and fight the page transition, so ask for an instant scroll
 * and fall back to the legacy signature on browsers that predate that option.
 */
function jumpToTop() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  } catch {
    window.scrollTo(0, 0)
  }
}

/**
 * React Router keeps the window scroll offset across navigations, so a link
 * followed from halfway down a long page opens the next one halfway down too.
 * Reset to the top on forward navigation, honour in-page hash targets, and
 * leave back/forward alone so the browser restores the previous position.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return

    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) {
      target.scrollIntoView({ block: 'start' })
      return
    }

    jumpToTop()
  }, [pathname, hash, navigationType])

  return null
}

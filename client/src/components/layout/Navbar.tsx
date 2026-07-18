import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { MobileNav } from '@/components/layout/MobileNav'
import { UserMenu } from '@/components/layout/UserMenu'
import { useScrolled } from '@/hooks/useScrolled'
import { useAuth } from '@/hooks/useAuth'
import { NAV_LINKS, ROUTES } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'
import { cn } from '@/lib/utils'

/**
 * Public site navigation. Transparent while the page is at the top,
 * gains a solid background and hairline border once scrolled.
 */
export function Navbar() {
  const scrolled = useScrolled()
  const { status, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors',
        scrolled ? 'border-border bg-background' : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to={ROUTES.home} className="font-display text-xl font-bold text-primary">
          {APP_NAME}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {status === 'authenticated' && user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : status === 'unauthenticated' ? (
            <>
              <Button asChild variant="ghost">
                <Link to={ROUTES.login}>Log in</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.register}>Create account</Link>
              </Button>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

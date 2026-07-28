import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { MobileNav } from '@/components/layout/MobileNav'
import { DonorDrawer } from '@/components/layout/DonorDrawer'
import { SidebarDrawer } from '@/components/layout/SidebarDrawer'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { BrandMark } from '@/components/layout/BrandMark'
import { useScrolled } from '@/hooks/useScrolled'
import { useAuth } from '@/hooks/useAuth'
import { ADMIN_NAV_LINKS, FUNDRAISER_NAV_LINKS, NAV_LINKS, ROUTES, startCampaignPath } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'
import { cn } from '@/lib/utils'

/**
 * Public site navigation. Transparent at the top of the page, gaining a
 * blurred background and hairline once scrolled. Every signed-in role reaches
 * its own surfaces through a left-hand drawer, so no role links crowd the bar:
 * donors get the DonorDrawer, fundraisers and admins get their console drawer.
 */
export function Navbar() {
  const scrolled = useScrolled()
  const { status, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  const isAuthed = status === 'authenticated' && !!user
  const isDonor = isAuthed && user.role === 'donor'
  const isPrivileged = isAuthed && (user.role === 'fundraiser' || user.role === 'admin')

  const consoleLinks = user?.role === 'admin' ? ADMIN_NAV_LINKS : FUNDRAISER_NAV_LINKS

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-300',
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-1">
          {isDonor && user && <DonorDrawer user={user} />}
          {isPrivileged && user && (
            <SidebarDrawer user={user} links={consoleLinks} onLogout={handleLogout} />
          )}
          <Link
            to={ROUTES.home}
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground"
          >
            <BrandMark />
            {APP_NAME}
          </Link>
        </div>

        <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {status === 'unauthenticated' && (
            <Button asChild variant="ghost">
              <Link to={startCampaignPath()}>
                <Megaphone aria-hidden="true" />
                Start a campaign
              </Link>
            </Button>
          )}
          {isAuthed && <NotificationBell />}
          <ThemeToggle />
          {status === 'unauthenticated' && (
            <>
              <Button asChild variant="ghost">
                <Link to={ROUTES.login}>Log in</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.register}>Create account</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile actions. Signed-in roles navigate via the left drawer, so the
            full-screen sheet is only for anonymous visitors. */}
        <div className="flex items-center gap-1 md:hidden">
          {isAuthed && <NotificationBell />}
          <ThemeToggle />
          {status === 'unauthenticated' && <MobileNav />}
        </div>
      </div>
    </header>
  )
}

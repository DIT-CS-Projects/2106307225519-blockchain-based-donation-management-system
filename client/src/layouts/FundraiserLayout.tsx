import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { AccountMenu } from '@/components/layout/AccountMenu'
import { SidebarDrawer } from '@/components/layout/SidebarDrawer'
import { BrandMark } from '@/components/layout/BrandMark'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { useAuth } from '@/hooks/useAuth'
import { FUNDRAISER_NAV_LINKS, ROUTES } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'

/** Shell for the fundraiser console: a slide-in navigation drawer + sticky top bar. */
export function FundraiserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  if (!user) return null

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-1">
          <SidebarDrawer user={user} links={FUNDRAISER_NAV_LINKS} onLogout={() => void handleLogout()} />
          <Link
            to={ROUTES.fundraiser}
            className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
          >
            <BrandMark />
            {APP_NAME}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
          <div className="ml-1 border-l border-border pl-1">
            <AccountMenu user={user} onLogout={() => void handleLogout()} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

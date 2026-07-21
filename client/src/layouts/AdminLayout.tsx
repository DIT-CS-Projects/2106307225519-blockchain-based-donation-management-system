import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { useAuth } from '@/hooks/useAuth'
import { ADMIN_NAV_LINKS, ROUTES } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'
import { cn } from '@/lib/utils'

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {ADMIN_NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === ROUTES.adminDashboard}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Shell for the admin console: fixed sidebar (drawer on mobile) + top bar. */
export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border lg:flex lg:flex-col">
        <Link to={ROUTES.adminDashboard} className="flex h-16 items-center gap-2 px-6">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          <span className="font-display text-lg font-bold text-primary">{APP_NAME} Admin</span>
        </Link>
        <SidebarLinks />
        <div className="border-t border-border p-3">
          <Button variant="ghost" className="w-full justify-start" onClick={() => void handleLogout()}>
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex h-full w-72 flex-col bg-background">
            <div className="flex h-16 items-center justify-between px-6">
              <span className="font-display text-lg font-bold text-primary">{APP_NAME} Admin</span>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
                <X />
              </Button>
            </div>
            <SidebarLinks onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-border p-3">
              <Button variant="ghost" className="w-full justify-start" onClick={() => void handleLogout()}>
                <LogOut aria-hidden="true" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu />
            </Button>
            <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Administrator
            </span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
            <span className="ml-2 hidden text-sm font-medium sm:inline">{user?.fullName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

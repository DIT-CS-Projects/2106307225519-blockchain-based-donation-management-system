import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES, type ConsoleNavLink } from '@/constants/routes'
import { cn, getInitials } from '@/lib/utils'
import type { AuthUser } from '@/services/auth'

interface ConsoleSidebarProps {
  user: AuthUser
  links: ConsoleNavLink[]
  /** Called after any in-panel navigation, so the drawer host can close itself. */
  onNavigate?: () => void
  /** Renders the header close control (drawer use). */
  onClose?: () => void
  onLogout: () => void
}

const SECTION_LABEL: Record<AuthUser['role'], string> = {
  admin: 'Admin console',
  fundraiser: 'Fundraising',
  donor: 'Menu',
}

/**
 * The slide-in navigation panel for the admin and fundraiser consoles. It is the
 * same drawer the donor uses (a "Menu" header over a profile card and an iconed
 * link list), so every signed-in role navigates the same way. Purely
 * presentational: the host owns the Dialog shell and open/close.
 */
export function ConsoleSidebar({ user, links, onNavigate, onClose, onLogout }: ConsoleSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <span className="text-sm font-semibold text-muted-foreground">Menu</span>
        {onClose && (
          <Button variant="ghost" size="icon" aria-label="Close menu" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 border-y border-border px-5 py-4">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold text-secondary-foreground"
        >
          {getInitials(user.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{user.fullName}</p>
          <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
        </div>
      </div>

      <nav aria-label="Console" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-1.5 text-xs font-semibold text-muted-foreground">
          {SECTION_LABEL[user.role]}
        </p>
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <link.icon className="size-5 shrink-0" aria-hidden="true" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground">
          <Link to={ROUTES.home} onClick={onNavigate}>
            <ExternalLink aria-hidden="true" />
            View public site
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <LogOut aria-hidden="true" />
          Log out
        </Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, Compass, Gift, LayoutDashboard, LogOut, Menu, Receipt, User, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/services/auth'

interface DrawerLink {
  label: string
  to: string
  hash?: string
  icon: LucideIcon
}

// The donor's giving surfaces. The two /donations anchors deep-link into the
// "Campaigns you support" and "All transactions" sections of that page.
const GIVING: DrawerLink[] = [
  { label: 'Overview', to: ROUTES.donations, icon: LayoutDashboard },
  { label: 'Campaigns you support', to: ROUTES.donations, hash: '#supported-campaigns', icon: Compass },
  { label: 'Transactions', to: ROUTES.donations, hash: '#transactions', icon: Receipt },
  { label: 'Rewards', to: ROUTES.rewards, icon: Gift },
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/**
 * The signed-in donor's navigation drawer, opened from a menu button in the
 * top-left. It is the donor's single menu: it replaces the desktop user menu
 * and the mobile site sheet for this role. Radix Dialog handles the focus trap,
 * Escape, scroll lock, and overlay.
 */
export function DonorDrawer({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { pathname, hash } = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    close()
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  const isActive = (link: DrawerLink): boolean => {
    if (link.hash) return pathname === link.to && hash === link.hash
    if (link.to === ROUTES.donations) return pathname === ROUTES.donations && !hash
    return pathname === link.to || pathname.startsWith(`${link.to}/`)
  }

  const renderLink = (link: DrawerLink) => (
    <li key={link.label}>
      <Link
        to={`${link.to}${link.hash ?? ''}`}
        onClick={close}
        aria-current={isActive(link) ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive(link)
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <link.icon className="size-5 shrink-0" aria-hidden="true" />
        {link.label}
      </Link>
    </li>
  )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-background text-foreground shadow-2xl outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:slide-in-from-left motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:slide-out-to-left"
        >
          <div className="flex h-16 items-center justify-between px-5">
            <Dialog.Title className="text-sm font-semibold text-muted-foreground">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <X />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-3 border-y border-border px-5 py-4">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold text-secondary-foreground"
            >
              {initials(user.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.fullName}</p>
              <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <nav aria-label="Donor" className="flex-1 overflow-y-auto px-3 py-4">
            <p className="px-3 pb-1.5 text-xs font-semibold text-muted-foreground">Your giving</p>
            <ul className="space-y-1">{GIVING.map(renderLink)}</ul>
            <ul className="mt-1 space-y-1 border-t border-border pt-3">
              {renderLink({ label: 'Account', to: ROUTES.account, icon: User })}
            </ul>
          </nav>

          <div className="space-y-2 border-t border-border px-3 py-4">
            <Button asChild size="sm" className="w-full justify-center">
              <Link to={ROUTES.campaigns} onClick={close}>
                Browse campaigns <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

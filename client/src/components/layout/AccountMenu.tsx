import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { StatusBadge, type StatusTone } from '@/components/shared/StatusBadge'
import { ROUTES } from '@/constants/routes'
import type { AuthUser, UserRole } from '@/services/auth'
import { cn } from '@/lib/utils'

const ROLE_TONE: Record<UserRole, StatusTone> = {
  admin: 'info',
  fundraiser: 'success',
  donor: 'neutral',
}

interface AccountMenuProps {
  user: AuthUser
  onLogout: () => void
}

/**
 * Account menu for a console top bar (admin, fundraiser): profile settings and
 * sign out. Open/close mechanics mirror NotificationBell (outside-click + Escape).
 */
export function AccountMenu({ user, onLogout }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const firstName = user.fullName.split(' ')[0]
  const roleLabel = user.role[0].toUpperCase() + user.role.slice(1)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="size-4" aria-hidden="true" />
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{firstName}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="min-w-0 truncate text-sm font-medium">{user.fullName}</p>
              <StatusBadge label={roleLabel} tone={ROLE_TONE[user.role]} className="shrink-0" />
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              to={ROUTES.account}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <User className="size-4 text-muted-foreground" aria-hidden="true" />
              Account settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

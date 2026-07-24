import { Link } from 'react-router-dom'
import { HandCoins, LayoutDashboard, LogOut, Megaphone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import type { AuthUser } from '@/services/auth'

interface UserMenuProps {
  user: AuthUser
  onLogout: () => void
}

/** Desktop navbar controls for a signed-in user. */
export function UserMenu({ user, onLogout }: UserMenuProps) {
  const firstName = user.fullName.split(' ')[0]

  return (
    <div className="flex items-center gap-1">
      {user.role === 'admin' && (
        <Button asChild variant="ghost">
          <Link to={ROUTES.adminDashboard}>
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      )}
      {user.role === 'fundraiser' && (
        <Button asChild variant="ghost">
          <Link to={ROUTES.fundraiser}>
            <Megaphone aria-hidden="true" />
            Fundraising
          </Link>
        </Button>
      )}
      {user.role === 'donor' && (
        <Button asChild variant="ghost">
          <Link to={ROUTES.donations}>
            <HandCoins aria-hidden="true" />
            Donations
          </Link>
        </Button>
      )}
      <Button asChild variant="ghost">
        <Link to={ROUTES.account}>
          <User aria-hidden="true" />
          {firstName}
        </Link>
      </Button>
      <Button variant="secondary" onClick={onLogout}>
        <LogOut aria-hidden="true" />
        Log out
      </Button>
    </div>
  )
}

import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProfileForm } from '@/components/account/ProfileForm'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'
import { Button } from '@/components/ui/button'
import { GradientHeader, Stagger, StaggerItem } from '@/components/shared/motion'
import { StatusBadge, type StatusTone } from '@/components/shared/StatusBadge'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/utils/format'
import type { UserRole } from '@/services/auth'

const ROLE_TONE: Record<UserRole, StatusTone> = {
  admin: 'info',
  fundraiser: 'success',
  donor: 'neutral',
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AccountPage() {
  const { user, updateUser, logout, logoutAll } = useAuth()
  const navigate = useNavigate()

  // ProtectedRoute guarantees a user; this satisfies the type and is defensive.
  if (!user) return null

  const handlePasswordChanged = async () => {
    await logout()
    navigate(ROUTES.login, {
      replace: true,
      state: { notice: 'Password changed. Please sign in again.' },
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  const handleLogoutAll = async () => {
    await logoutAll()
    navigate(ROUTES.login, {
      replace: true,
      state: { notice: 'Signed out of all devices.' },
    })
  }

  const roleLabel = user.role[0].toUpperCase() + user.role.slice(1)

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <GradientHeader>
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-2xl font-semibold text-secondary-foreground">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">{user.fullName}</h1>
              <StatusBadge label={roleLabel} tone={ROLE_TONE[user.role]} />
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {user.username ? `@${user.username} · ` : ''}
              {user.email}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </GradientHeader>

      <Stagger className="mt-8 space-y-8">
        <StaggerItem>
          <AccountCard title="Profile" description="Update your name and contact details.">
            <ProfileForm user={user} onUpdated={updateUser} />
          </AccountCard>
        </StaggerItem>

        <StaggerItem>
          <AccountCard title="Password" description="Change the password you use to sign in.">
            <ChangePasswordForm onChanged={handlePasswordChanged} />
          </AccountCard>
        </StaggerItem>

        <StaggerItem>
          <AccountCard
            title="Sessions"
            description="Sign out here, or everywhere you are currently signed in."
          >
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleLogout}>
                Log out
              </Button>
              <Button variant="danger" onClick={handleLogoutAll}>
                Log out of all devices
              </Button>
            </div>
          </AccountCard>
        </StaggerItem>
      </Stagger>
    </section>
  )
}

interface AccountCardProps {
  title: string
  description: string
  children: ReactNode
}

function AccountCard({ title, description, children }: AccountCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

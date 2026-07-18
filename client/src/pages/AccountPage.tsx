import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProfileForm } from '@/components/account/ProfileForm'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

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

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Your account</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Manage your profile and keep your sign-in secure.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        <AccountCard title="Profile" description="Update your name and contact details.">
          <ProfileForm user={user} onUpdated={updateUser} />
        </AccountCard>

        <AccountCard title="Password" description="Change the password you use to sign in.">
          <ChangePasswordForm onChanged={handlePasswordChanged} />
        </AccountCard>

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
      </div>
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

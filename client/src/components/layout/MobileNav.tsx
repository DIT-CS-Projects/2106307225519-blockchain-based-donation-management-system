import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { NAV_LINKS, ROUTES, startCampaignPath } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'
import { cn } from '@/lib/utils'

/**
 * Full-screen navigation sheet for small screens.
 * Radix Dialog provides the focus trap, Escape handling, and scroll lock.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { status, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    close()
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-background text-foreground outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0"
        >
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>

          <div className="flex h-16 items-center justify-between px-6">
            <Link
              to={ROUTES.home}
              onClick={close}
              className="flex items-center gap-2 font-display text-xl font-bold text-foreground"
            >
              <BrandMark />
              {APP_NAME}
            </Link>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <X />
              </Button>
            </Dialog.Close>
          </div>

          <nav aria-label="Main" className="flex flex-1 flex-col justify-center gap-2 px-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === ROUTES.home}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-2xl font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-foreground hover:bg-muted',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3 px-6 pb-10">
            {status === 'authenticated' && user ? (
              <>
                {user.role === 'admin' && (
                  <Button asChild variant="secondary" size="lg">
                    <Link to={ROUTES.adminDashboard} onClick={close}>
                      Dashboard
                    </Link>
                  </Button>
                )}
                {user.role === 'fundraiser' && (
                  <Button asChild variant="secondary" size="lg">
                    <Link to={ROUTES.fundraiser} onClick={close}>
                      Fundraising
                    </Link>
                  </Button>
                )}
                {user.role === 'donor' && (
                  <>
                    <Button asChild variant="secondary" size="lg">
                      <Link to={ROUTES.donations} onClick={close}>
                        Donations
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                      <Link to={startCampaignPath('donor')} onClick={close}>
                        Start a campaign
                      </Link>
                    </Button>
                  </>
                )}
                <Button asChild variant="secondary" size="lg">
                  <Link to={ROUTES.account} onClick={close}>
                    Account
                  </Link>
                </Button>
                <Button size="lg" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : status === 'unauthenticated' ? (
              <>
                <Button asChild variant="secondary" size="lg">
                  <Link to={startCampaignPath()} onClick={close}>
                    Start a campaign
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to={ROUTES.login} onClick={close}>
                    Log in
                  </Link>
                </Button>
                <Button asChild size="lg">
                  <Link to={ROUTES.register} onClick={close}>
                    Create account
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

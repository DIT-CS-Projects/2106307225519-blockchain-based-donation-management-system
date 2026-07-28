import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConsoleSidebar } from '@/components/layout/ConsoleSidebar'
import { type ConsoleNavLink } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/services/auth'

interface SidebarDrawerProps {
  user: AuthUser
  links: ConsoleNavLink[]
  onLogout: () => void
  /** Extra classes for the trigger button. */
  triggerClassName?: string
}

/**
 * Slide-in host for the console navigation, opened from a menu button. Radix
 * Dialog supplies the focus trap, Escape handling, scroll lock, and overlay,
 * matching the donor drawer exactly so admins and fundraisers navigate the same
 * slidable panel donors do. Used in both the console top bar and the public
 * navbar.
 */
export function SidebarDrawer({ user, links, onLogout, triggerClassName }: SidebarDrawerProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className={cn(triggerClassName)}>
          <Menu />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-background text-foreground shadow-2xl outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:slide-in-from-left motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:slide-out-to-left"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <ConsoleSidebar
            user={user}
            links={links}
            onNavigate={close}
            onClose={close}
            onLogout={() => {
              close()
              onLogout()
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

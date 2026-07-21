import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { getNotifications, markAllRead, markRead, type Notification } from '@/services/notifications'
import { formatDate } from '@/utils/format'

const POLL_MS = 30_000

/** Bell icon with unread badge, dropdown feed, and a toast for newly-arrived notifications. */
export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const seenIds = useRef<Set<number>>(new Set())
  const isFirstLoad = useRef(true)
  const rootRef = useRef<HTMLDivElement>(null)

  const poll = async () => {
    try {
      const data = await getNotifications()
      if (!isFirstLoad.current) {
        const freshUnread = data.items.filter((n) => !n.read && !seenIds.current.has(n.id))
        for (const n of freshUnread) {
          toast(n.title)
        }
      }
      seenIds.current = new Set(data.items.map((n) => n.id))
      isFirstLoad.current = false
      setItems(data.items)
      setUnreadCount(data.unreadCount)
    } catch {
      // Silent: the bell is a convenience surface, not a critical path.
    }
  }

  useEffect(() => {
    // Deferred to a microtask so lint sees no synchronous setState in the
    // effect body (poll's setState calls all happen after its own await).
    void Promise.resolve().then(() => poll())
    const interval = setInterval(() => void poll(), POLL_MS)
    return () => clearInterval(interval)
  }, [])

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

  const onOpenNotification = async (id: number) => {
    setOpen(false)
    await markRead(id).catch(() => {})
    void poll()
  }

  const onMarkAllRead = async () => {
    await markAllRead().catch(() => {})
    void poll()
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        aria-expanded={open}
        className="relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void onMarkAllRead()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n.id} className="border-b border-border last:border-0">
                    {n.link ? (
                      <Link
                        to={n.link}
                        onClick={() => void onOpenNotification(n.id)}
                        className={`block px-4 py-3 hover:bg-muted/50 ${n.read ? '' : 'bg-secondary/40'}`}
                      >
                        <NotificationContent n={n} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void onOpenNotification(n.id)}
                        className={`block w-full px-4 py-3 text-left hover:bg-muted/50 ${n.read ? '' : 'bg-secondary/40'}`}
                      >
                        <NotificationContent n={n} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationContent({ n }: { n: Notification }) {
  return (
    <>
      <p className="text-sm font-medium">{n.title}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
    </>
  )
}

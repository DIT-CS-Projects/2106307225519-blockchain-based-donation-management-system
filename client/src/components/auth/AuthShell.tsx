import type { ReactNode } from 'react'
import { m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/layout/BrandMark'
import { ROUTES } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/** Centered, subtly animated card shared by every authentication page. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-md flex-col justify-center px-6 py-12">
      <m.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="text-center">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground"
          >
            <BrandMark className="size-8" />
            {APP_NAME}
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </m.div>
    </section>
  )
}

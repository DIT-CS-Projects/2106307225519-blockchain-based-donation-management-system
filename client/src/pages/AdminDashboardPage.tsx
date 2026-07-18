import { ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Landing page for administrators after sign-in (docs/BUSINESS_RULES.md).
 * The full management console ships in a later stage; this confirms the
 * role-gated route and RBAC are in place.
 */
export function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
        <ShieldCheck className="size-6 text-secondary-foreground" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-medium text-primary">Administrator</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Welcome, {user?.fullName}
      </h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground">
        You are signed in with administrator access. Campaign management, beneficiary
        verification, disbursements, reports, and the audit log arrive in the next stages.
      </p>
    </section>
  )
}

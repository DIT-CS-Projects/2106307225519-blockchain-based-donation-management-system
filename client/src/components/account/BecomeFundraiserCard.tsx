import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { toApiError } from '@/services/api'
import { applyFundraiser, getFundraiserApplication } from '@/services/auth'
import { ROUTES } from '@/constants/routes'
import {
  fundraiserApplicationSchema,
  type FundraiserApplicationValues,
} from '@/lib/adminSchemas'

/**
 * Lets a donor apply to become a fundraiser and shows the status of an existing
 * application (Decision 020). Fundraisers and admins see a shortcut instead.
 */
export function BecomeFundraiserCard() {
  const { user, refreshSession } = useAuth()
  const [activating, setActivating] = useState(false)
  const { data: application, loading, retry } = useFetch(
    useCallback(() => getFundraiserApplication(), []),
  )

  if (!user) return null

  // Already a fundraiser (or admin): offer the dashboard rather than an apply form.
  if (user.role === 'fundraiser' || user.role === 'admin') {
    return (
      <Card>
        <Header />
        <p className="mt-1 text-sm text-muted-foreground">
          You can create and manage your own campaigns.
        </p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.fundraiser}>Go to fundraiser dashboard</Link>
        </Button>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <Header />
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      </Card>
    )
  }

  // Approved but the access token still says donor: activate the new role.
  if (application?.status === 'approved') {
    const activate = async () => {
      setActivating(true)
      try {
        await refreshSession()
        toast.success('Fundraiser access activated')
      } catch (err) {
        toast.error(toApiError(err).message)
      } finally {
        setActivating(false)
      }
    }
    return (
      <Card>
        <Header />
        <div className="mt-3 flex items-center gap-2">
          <StatusBadge label="approved" tone="success" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Your application was approved. Activate your fundraiser access to start creating campaigns.
        </p>
        <Button className="mt-6" onClick={() => void activate()} disabled={activating}>
          {activating ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Activating…
            </>
          ) : (
            'Activate fundraiser access'
          )}
        </Button>
      </Card>
    )
  }

  if (application?.status === 'pending') {
    return (
      <Card>
        <Header />
        <div className="mt-3">
          <StatusBadge label="under review" tone="warning" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Thanks for applying. An administrator is reviewing your application as {application.displayName}.
          We will notify you when there is an update.
        </p>
      </Card>
    )
  }

  // No application, or a previous one was rejected: show (or re-show) the form.
  return (
    <Card>
      <Header />
      {application?.status === 'rejected' && (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <StatusBadge label="not approved" tone="danger" />
          {application.decisionReason && (
            <p className="mt-2 text-muted-foreground">Reason: {application.decisionReason}</p>
          )}
          <p className="mt-1 text-muted-foreground">You can update your details and apply again.</p>
        </div>
      )}
      <ApplyForm onApplied={retry} />
    </Card>
  )
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Megaphone className="size-5" aria-hidden="true" />
      </span>
      <h2 className="font-display text-lg font-semibold">Become a fundraiser</h2>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-6 sm:p-8">{children}</div>
}

function ApplyForm({ onApplied }: { onApplied: () => void }) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FundraiserApplicationValues>({ resolver: zodResolver(fundraiserApplicationSchema) })

  const onSubmit = async (values: FundraiserApplicationValues) => {
    setFormError(null)
    try {
      await applyFundraiser(values)
      toast.success('Application submitted')
      onApplied()
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  return (
    <>
      <p className="mt-1 text-sm text-muted-foreground">
        Anyone with a genuine cause can raise funds. Tell us about yours; an administrator reviews
        every application before your campaigns go live.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-5">
        <FormField id="displayName" label="Name you fundraise under" error={errors.displayName?.message}>
          <Input id="displayName" placeholder="e.g. Hope Foundation" {...register('displayName')} />
        </FormField>
        <FormField id="causeDescription" label="Your cause" error={errors.causeDescription?.message}>
          <Textarea id="causeDescription" rows={4} {...register('causeDescription')} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="identityReference"
            label="National ID or registration no."
            error={errors.identityReference?.message}
          >
            <Input id="identityReference" {...register('identityReference')} />
          </FormField>
          <FormField id="contactPhone" label="Contact phone" error={errors.contactPhone?.message}>
            <Input id="contactPhone" {...register('contactPhone')} />
          </FormField>
        </div>
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Submitting…
              </>
            ) : (
              'Apply to fundraise'
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

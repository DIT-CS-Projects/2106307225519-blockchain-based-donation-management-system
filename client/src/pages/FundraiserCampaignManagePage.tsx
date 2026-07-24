import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FormField } from '@/components/shared/FormField'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { StatusBadge, campaignStatusTone } from '@/components/shared/StatusBadge'
import { GradientHeader } from '@/components/shared/motion'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import {
  getManagedCampaign,
  submitCampaign,
  type AdminCampaign,
} from '@/services/adminCampaigns'
import { createBeneficiary, getManagedBeneficiaries, type AdminBeneficiary } from '@/services/beneficiaries'
import {
  getAvailableBalance,
  getDisbursements,
  initiateDisbursement,
  type AvailableBalance,
} from '@/services/disbursements'
import { ROUTES, fundraiserCampaignEditPath } from '@/constants/routes'
import { formatTZS, formatDate } from '@/utils/format'
import {
  beneficiaryFormSchema,
  disbursementFormSchema,
  type BeneficiaryFormValues,
  type DisbursementFormValues,
} from '@/lib/adminSchemas'

export function FundraiserCampaignManagePage() {
  const { id } = useParams()
  const campaignId = Number(id)
  const navigate = useNavigate()

  const { data: campaign, loading, error, retry } = useFetch(
    useCallback(() => getManagedCampaign(campaignId), [campaignId]),
  )

  if (loading) return <LoadingScreen label="Loading campaign" />

  if (error || !campaign) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Could not load this campaign.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.fundraiser)}>
          Back to your campaigns
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <Link
        to={ROUTES.fundraiser}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Your campaigns
      </Link>

      <CampaignHeader campaign={campaign} onChanged={retry} />

      <BeneficiariesSection campaignId={campaignId} />

      {campaign.status === 'active' && <PayoutsSection campaignId={campaignId} />}
    </section>
  )
}

function CampaignHeader({ campaign, onChanged }: { campaign: AdminCampaign; onChanged: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = campaign.status === 'draft' || campaign.status === 'rejected'

  const onSubmitForReview = async () => {
    setSubmitting(true)
    try {
      await submitCampaign(campaign.id)
      toast.success('Submitted for review')
      onChanged()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GradientHeader className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{campaign.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{campaign.category}</p>
        </div>
        <StatusBadge label={campaign.status} tone={campaignStatusTone(campaign.status)} />
      </div>

      {campaign.status === 'pending_review' && (
        <p className="mt-4 text-sm text-muted-foreground">
          This campaign is awaiting administrator review. You can still edit it.
        </p>
      )}
      {campaign.status === 'rejected' && campaign.rejectionReason && (
        <p className="mt-4 text-sm text-destructive">Reason: {campaign.rejectionReason}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link to={fundraiserCampaignEditPath(campaign.id)}>Edit</Link>
        </Button>
        {canSubmit && (
          <Button onClick={() => void onSubmitForReview()} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for review'}
          </Button>
        )}
      </div>
    </GradientHeader>
  )
}

function BeneficiariesSection({ campaignId }: { campaignId: number }) {
  const [adding, setAdding] = useState(false)
  const { data, loading, retry } = useFetch(
    useCallback(() => getManagedBeneficiaries(campaignId), [campaignId]),
  )

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Beneficiaries</h2>
        <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Close' : 'Add beneficiary'}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Add the people or groups your campaign supports. An administrator verifies each one before it
        can receive a payout.
      </p>

      {adding && (
        <AddBeneficiaryForm
          campaignId={campaignId}
          onAdded={() => {
            setAdding(false)
            retry()
          }}
        />
      )}

      {loading && <Skeleton className="mt-4 h-24 w-full" />}
      {!loading && data && (
        <ul className="mt-4 grid gap-3">
          {data.items.length === 0 && (
            <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No beneficiaries yet.
            </li>
          )}
          {data.items.map((b) => (
            <li
              key={b.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{b.description}</p>
              </div>
              {b.verified ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" aria-hidden="true" /> Verified
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                  <Clock className="size-4" aria-hidden="true" /> Awaiting verification
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AddBeneficiaryForm({
  campaignId,
  onAdded,
}: {
  campaignId: number
  onAdded: () => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: { campaignId: String(campaignId) },
  })

  const onSubmit = async (values: BeneficiaryFormValues) => {
    setFormError(null)
    try {
      await createBeneficiary({
        campaignId,
        name: values.name,
        description: values.description,
        category: values.category || undefined,
        location: values.location || undefined,
        contactInfo: values.contactInfo || undefined,
      })
      toast.success('Beneficiary added')
      onAdded()
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 grid gap-4 rounded-lg border border-border bg-muted/30 p-5"
    >
      <FormField id="name" label="Name" error={errors.name?.message}>
        <Input id="name" {...register('name')} />
      </FormField>
      <FormField id="description" label="Description" error={errors.description?.message}>
        <Textarea id="description" rows={3} {...register('description')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="location" label="Location (optional)" error={errors.location?.message}>
          <Input id="location" {...register('location')} />
        </FormField>
        <FormField id="contactInfo" label="Contact (optional, private)" error={errors.contactInfo?.message}>
          <Input id="contactInfo" {...register('contactInfo')} />
        </FormField>
      </div>
      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add beneficiary'}
        </Button>
      </div>
    </form>
  )
}

function PayoutsSection({ campaignId }: { campaignId: number }) {
  const { data: balance, retry: retryBalance } = useFetch(
    useCallback(() => getAvailableBalance(campaignId), [campaignId]),
  )
  const { data: disbursements, retry: retryList } = useFetch(
    useCallback(() => getDisbursements({ campaignId, limit: 50 }), [campaignId]),
  )
  const { data: beneficiaries } = useFetch(
    useCallback(() => getManagedBeneficiaries(campaignId), [campaignId]),
  )

  const verified = (beneficiaries?.items ?? []).filter((b) => b.verified)

  const refresh = () => {
    retryBalance()
    retryList()
  }

  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-semibold">Payouts</h2>
      {balance && <BalancePanel balance={balance} />}

      <PayoutForm
        campaignId={campaignId}
        verified={verified}
        selfServeRemaining={balance?.selfServeRemaining ?? 0}
        onDone={refresh}
      />

      <ul className="mt-6 grid gap-3">
        {(disbursements?.items ?? []).length === 0 && (
          <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No payouts yet.
          </li>
        )}
        {disbursements?.items.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{formatTZS(d.amount)}</p>
              <p className="text-sm text-muted-foreground">
                {d.beneficiaryName} · {formatDate(d.createdAt)}
              </p>
            </div>
            <StatusBadge
              label={d.status}
              tone={
                d.status === 'completed'
                  ? 'success'
                  : d.status === 'pending_approval'
                    ? 'warning'
                    : d.status === 'failed' || d.status === 'rejected'
                      ? 'danger'
                      : 'info'
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function BalancePanel({ balance }: { balance: AvailableBalance }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Available balance</span>
        <span className="font-semibold">{formatTZS(balance.availableBalance)}</span>
      </div>
      <div className="mt-1 flex justify-between">
        <span className="text-muted-foreground">Released without approval</span>
        <span className="font-medium">{formatTZS(balance.cumulativeSelfReleased)}</span>
      </div>
      <div className="mt-1 flex justify-between border-t border-border pt-1">
        <span className="text-muted-foreground">Self-serve remaining</span>
        <span className="font-semibold">{formatTZS(balance.selfServeRemaining)}</span>
      </div>
    </div>
  )
}

function PayoutForm({
  campaignId,
  verified,
  selfServeRemaining,
  onDone,
}: {
  campaignId: number
  verified: AdminBeneficiary[]
  selfServeRemaining: number
  onDone: () => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DisbursementFormValues>({
    resolver: zodResolver(disbursementFormSchema),
    defaultValues: { campaignId: String(campaignId) },
  })

  const amount = Number(watch('amount'))
  const needsApproval = Number.isFinite(amount) && amount > 0 && amount >= selfServeRemaining

  const onSubmit = async (values: DisbursementFormValues) => {
    setFormError(null)
    try {
      await initiateDisbursement({
        campaignId,
        beneficiaryId: Number(values.beneficiaryId),
        amount: Number(values.amount),
        purpose: values.purpose,
      })
      toast.success('Payout initiated')
      reset({ campaignId: String(campaignId), beneficiaryId: '', amount: '', purpose: '' })
      onDone()
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  if (verified.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Add a beneficiary and wait for an administrator to verify it before you can release a payout.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-5 grid gap-4 rounded-lg border border-border bg-card p-5"
    >
      <FormField id="beneficiaryId" label="Verified beneficiary" error={errors.beneficiaryId?.message}>
        <Select id="beneficiaryId" {...register('beneficiaryId')}>
          <option value="">Select a beneficiary</option>
          {verified.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="amount" label="Amount (TZS)" error={errors.amount?.message}>
          <Input id="amount" type="number" inputMode="numeric" {...register('amount')} />
        </FormField>
        <FormField id="purpose" label="Purpose" error={errors.purpose?.message}>
          <Input id="purpose" {...register('purpose')} />
        </FormField>
      </div>
      {needsApproval && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          This payout reaches your self-serve limit, so an administrator must approve it before the
          funds are released.
        </p>
      )}
      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Release payout'}
        </Button>
      </div>
    </form>
  )
}

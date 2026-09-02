import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { CheckCircle2, Clock, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { FormField } from '@/components/shared/FormField'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import {
  createBeneficiary,
  getManagedBeneficiaries,
  updateBeneficiary,
  type AdminBeneficiary,
} from '@/services/beneficiaries'
import {
  beneficiaryFormSchema,
  mobileNumberSchema,
  type BeneficiaryFormValues,
} from '@/lib/adminSchemas'

const PAYOUT_NUMBER_HINT =
  'Mobile-money number that receives the payout, for example 0712345678 or 255712345678.'

/** Beneficiaries of a campaign the signed-in fundraiser owns (Decision 020). */
export function CampaignBeneficiaries({ campaignId }: { campaignId: number }) {
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
        Add the people or groups your campaign supports. An administrator verifies each one, and each
        needs a mobile-money number, before it can receive a payout.
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
            <li key={b.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
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
              </div>
              <PayoutNumber beneficiary={b} onSaved={retry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Inline view/edit of the one field that decides whether a payout can leave. */
function PayoutNumber({
  beneficiary,
  onSaved,
}: {
  beneficiary: AdminBeneficiary
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(beneficiary.mobileNumber ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    const parsed = mobileNumberSchema.safeParse(value)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid Tanzanian mobile number')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateBeneficiary(beneficiary.id, { mobileNumber: parsed.data })
      toast.success('Payout number saved')
      setEditing(false)
      onSaved()
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const fieldId = `payout-number-${beneficiary.id}`

  if (!editing) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-sm">
        <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
        {beneficiary.mobileNumber ? (
          <span className="text-muted-foreground">{beneficiary.mobileNumber}</span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400">
            No payout number yet, so this beneficiary cannot receive money.
          </span>
        )}
        <Button variant="link" size="sm" className="px-0" onClick={() => setEditing(true)}>
          {beneficiary.mobileNumber ? 'Change' : 'Add payout number'}
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <FormField
        id={fieldId}
        label="Mobile-money number"
        hint={PAYOUT_NUMBER_HINT}
        error={error ?? undefined}
      >
        <div className="flex flex-wrap gap-2">
          <Input
            id={fieldId}
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712345678"
            className="max-w-56"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button size="sm" disabled={saving} onClick={() => void onSave()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={() => {
              setValue(beneficiary.mobileNumber ?? '')
              setError(null)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
        </div>
      </FormField>
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
        mobileNumber: values.mobileNumber || undefined,
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
      <FormField
        id="mobileNumber"
        label="Mobile-money number"
        hint={PAYOUT_NUMBER_HINT}
        error={errors.mobileNumber?.message}
      >
        <Input id="mobileNumber" inputMode="tel" autoComplete="tel" placeholder="0712345678" {...register('mobileNumber')} />
      </FormField>
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

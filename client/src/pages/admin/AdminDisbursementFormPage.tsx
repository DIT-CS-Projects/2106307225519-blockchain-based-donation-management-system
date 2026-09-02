import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import { getCampaignsAdmin } from '@/services/adminCampaigns'
import { getBeneficiariesAdmin } from '@/services/beneficiaries'
import { getAvailableBalance, initiateDisbursement } from '@/services/disbursements'
import { DUAL_APPROVAL_THRESHOLD_TZS } from '@/constants/config'
import { ROUTES } from '@/constants/routes'
import { formatTZS } from '@/utils/format'
import { disbursementFormSchema, type DisbursementFormValues } from '@/lib/adminSchemas'

export function AdminDisbursementFormPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<number | null>(null)

  const { data: campaigns } = useFetch(useCallback(() => getCampaignsAdmin({ status: 'active', limit: 50 }), []))
  const balanceFetcher = useCallback(
    () => (campaignId ? getAvailableBalance(campaignId) : Promise.resolve(null)),
    [campaignId],
  )
  const { data: balance } = useFetch(balanceFetcher)
  // The admin list carries the payout number, so a beneficiary that cannot be
  // paid is visible here rather than only at submit time.
  const beneficiaryFetcher = useCallback(
    () =>
      campaignId
        ? getBeneficiariesAdmin({ campaignId, verified: true, limit: 50 }).then((r) => r.items)
        : Promise.resolve([]),
    [campaignId],
  )
  const { data: beneficiaries } = useFetch(beneficiaryFetcher)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DisbursementFormValues>({ resolver: zodResolver(disbursementFormSchema) })

  const watchedCampaignId = watch('campaignId')
  const watchedAmount = watch('amount')

  useEffect(() => {
    const parsed = Number(watchedCampaignId)
    setCampaignId(Number.isFinite(parsed) && parsed > 0 ? parsed : null)
  }, [watchedCampaignId])

  const onSubmit = async (values: DisbursementFormValues) => {
    setFormError(null)
    try {
      await initiateDisbursement({
        campaignId: Number(values.campaignId),
        beneficiaryId: Number(values.beneficiaryId),
        amount: Number(values.amount),
        purpose: values.purpose,
      })
      toast.success('Disbursement initiated')
      navigate(ROUTES.adminDisbursements)
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  const exceedsBalance = balance !== null && Number(watchedAmount) > (balance?.availableBalance ?? Infinity)
  const requiresApproval = Number(watchedAmount) >= DUAL_APPROVAL_THRESHOLD_TZS

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Initiate disbursement</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
        <FormField id="campaignId" label="Campaign" error={errors.campaignId?.message}>
          <Select id="campaignId" {...register('campaignId')}>
            <option value="">Select a campaign</option>
            {campaigns?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </FormField>

        {balance && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total raised</span>
              <span className="font-medium">{formatTZS(balance.totalRaised)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Already disbursed</span>
              <span className="font-medium">{formatTZS(balance.totalDisbursed)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">Available balance</span>
              <span className="font-semibold">{formatTZS(balance.availableBalance)}</span>
            </div>
          </div>
        )}

        <FormField
          id="beneficiaryId"
          label="Verified beneficiary"
          hint={
            beneficiaries?.some((b) => !b.mobileNumber)
              ? 'A beneficiary without a mobile-money number cannot be paid. Add one on the beneficiary record first.'
              : undefined
          }
          error={errors.beneficiaryId?.message}
        >
          <Select id="beneficiaryId" disabled={!campaignId} {...register('beneficiaryId')}>
            <option value="">
              {campaignId ? 'Select a beneficiary' : 'Choose a campaign first'}
            </option>
            {beneficiaries?.map((b) => (
              <option key={b.id} value={b.id} disabled={!b.mobileNumber}>
                {b.mobileNumber ? b.name : `${b.name} (no payout number)`}
              </option>
            ))}
          </Select>
          {campaignId && beneficiaries?.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              This campaign has no verified beneficiaries yet.
            </p>
          )}
        </FormField>

        <FormField id="amount" label="Amount (TZS)" error={errors.amount?.message}>
          <Input id="amount" type="number" inputMode="numeric" {...register('amount')} />
          {exceedsBalance && (
            <p className="mt-2 text-sm text-destructive">Amount exceeds the available balance.</p>
          )}
          {requiresApproval && !exceedsBalance && (
            <p className="mt-2 text-sm text-muted-foreground">
              At or above {formatTZS(DUAL_APPROVAL_THRESHOLD_TZS)}: a second administrator must approve
              this before payout.
            </p>
          )}
        </FormField>

        <FormField id="purpose" label="Purpose" error={errors.purpose?.message}>
          <Textarea id="purpose" rows={3} {...register('purpose')} />
        </FormField>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || exceedsBalance}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Submitting…
              </>
            ) : (
              'Initiate disbursement'
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.adminDisbursements)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

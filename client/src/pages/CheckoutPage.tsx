import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useFetch } from '@/hooks/useFetch'
import { completeMockPayment, getPaymentStatus } from '@/services/payments'
import { toApiError } from '@/services/api'
import { formatTZS } from '@/utils/format'
import { PAYMENT_METHODS } from '@/constants/config'
import {
  ROUTES,
  campaignDetailsPath,
  donationDetailsPath,
} from '@/constants/routes'

function providerLabel(method: string, provider: string): string {
  const rail = PAYMENT_METHODS.find((m) => m.key === method)
  return rail?.providers.find((p) => p.key === provider)?.label ?? provider
}

/**
 * Sandbox checkout page. It stands in for the payment gateway during local
 * development: it shows the pending charge and lets the donor complete or cancel
 * it, which drives the same provider callback a real gateway would send. Swapped
 * out entirely once a live provider issues its own hosted checkout.
 */
export function CheckoutPage() {
  const { reference = '' } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const fetcher = useCallback(() => getPaymentStatus(reference), [reference])
  const { data: status, error, loading } = useFetch(fetcher)

  const [processing, setProcessing] = useState<null | 'pay' | 'cancel'>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const run = async (outcome: 'SUCCESS' | 'CANCELLED') => {
    setProcessing(outcome === 'SUCCESS' ? 'pay' : 'cancel')
    setActionError(null)
    try {
      const result = await completeMockPayment(reference, token, outcome)
      if (result.status === 'success' && result.donationId) {
        navigate(`${donationDetailsPath(result.donationId)}?status=success`, { replace: true })
      } else if (status) {
        navigate(campaignDetailsPath(status.campaignId), { replace: true })
      } else {
        navigate(ROUTES.campaigns, { replace: true })
      }
    } catch (err) {
      setActionError(toApiError(err).message)
      setProcessing(null)
    }
  }

  if (loading) return <LoadingScreen label="Opening secure checkout" />

  if (error || !status) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">This checkout link is not valid</h1>
        <p className="mt-3 text-muted-foreground">
          The payment session may have expired. Start a new donation from the campaign page.
        </p>
        <Button asChild className="mt-8">
          <a href={ROUTES.campaigns}>Browse campaigns</a>
        </Button>
      </div>
    )
  }

  // Already resolved: send the donor to the right place instead of re-charging.
  if (status.status !== 'pending') {
    const paid = status.status === 'success' && status.donationId
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          {paid ? 'This donation is already complete' : 'This payment is no longer open'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {paid
            ? 'You can view the donation and download its receipt.'
            : 'Nothing was charged. You can start a new donation any time.'}
        </p>
        <Button asChild className="mt-8">
          <a href={paid ? donationDetailsPath(status.donationId!) : campaignDetailsPath(status.campaignId)}>
            {paid ? 'View donation' : 'Back to campaign'}
          </a>
        </Button>
      </div>
    )
  }

  const missingToken = token.length === 0

  return (
    <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <span className="text-sm font-semibold">Sandbox checkout</span>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">You are donating to</p>
        <h1 className="mt-1 font-display text-xl font-semibold leading-snug">
          {status.campaignTitle}
        </h1>

        <div className="mt-6 rounded-lg bg-muted/60 p-5 text-center">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">
            {formatTZS(status.amount)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            via {providerLabel(status.method, status.provider)}
          </p>
        </div>

        {missingToken && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            This checkout link is missing its security token. Please restart the donation.
          </p>
        )}
        {actionError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {actionError}
          </p>
        )}

        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={() => run('SUCCESS')}
          disabled={processing !== null || missingToken}
        >
          {processing === 'pay' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Confirming payment…
            </>
          ) : (
            <>Pay {formatTZS(status.amount)}</>
          )}
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => run('CANCELLED')}
          disabled={processing !== null}
        >
          {processing === 'cancel' ? 'Cancelling…' : 'Cancel'}
        </Button>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
          Simulated gateway for development. No real money moves.
        </p>
      </div>
    </div>
  )
}

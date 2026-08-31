import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Smartphone, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPaymentStatus, type PaymentStatus } from '@/services/payments'
import { formatTZS } from '@/utils/format'
import { PAYMENT_METHODS } from '@/constants/config'
import { campaignDetailsPath, donationDetailsPath } from '@/constants/routes'

// Webhooks normally complete within seconds. Poll more slowly as a recovery
// path for delayed webhook delivery without burning ClickPesa API quota.
const POLL_INTERVAL_MS = 10_000
const MAX_WAIT_MS = 5 * 60_000

function providerLabel(method: string, provider: string): string {
  const rail = PAYMENT_METHODS.find((m) => m.key === method)
  return rail?.providers.find((p) => p.key === provider)?.label ?? provider
}

type Phase = 'waiting' | 'failed' | 'timedout'

interface MobilePaymentWaitingProps {
  /** The pending transaction as first loaded; polling takes over from here. */
  initial: PaymentStatus
}

/**
 * Waiting screen for the AzamPay mobile-money push. The gateway hosts no
 * checkout page: the donor approves a USSD/PIN prompt on their handset and the
 * async callback flips the transaction. We poll status until it resolves, then
 * route to the receipt (success) or offer a retry (failed / timed out).
 */
export function MobilePaymentWaiting({ initial }: MobilePaymentWaitingProps) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('waiting')

  useEffect(() => {
    // Stop polling at the session expiry, or after our own ceiling, whichever comes first.
    const deadline = Math.min(Date.now() + MAX_WAIT_MS, new Date(initial.expiresAt).getTime())
    let active = true
    let timer = 0

    const tick = async () => {
      try {
        const next = await getPaymentStatus(initial.reference)
        if (!active) return
        if (next.status === 'success' && next.donationId) {
          navigate(`${donationDetailsPath(next.donationId)}?status=success`, { replace: true })
          return
        }
        if (next.status === 'failed' || next.status === 'cancelled' || next.status === 'expired') {
          setPhase('failed')
          return
        }
      } catch {
        // Transient poll failure: keep trying until the deadline.
      }
      if (!active) return
      if (Date.now() >= deadline) {
        setPhase('timedout')
        return
      }
      timer = window.setTimeout(tick, POLL_INTERVAL_MS)
    }

    timer = window.setTimeout(tick, POLL_INTERVAL_MS)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [initial.reference, initial.expiresAt, navigate])

  if (phase !== 'waiting') {
    const failed = phase === 'failed'
    return (
      <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <XCircle className="mx-auto size-10 text-destructive" aria-hidden="true" />
          <h1 className="mt-4 font-display text-xl font-semibold">
            {failed ? 'Payment not completed' : 'Still waiting for confirmation'}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {failed
              ? 'The payment was declined or cancelled. Nothing was charged. You can try again from the campaign.'
              : 'We have not received confirmation yet. If you approved the prompt, your receipt will appear in your donations shortly.'}
          </p>
          <Button asChild variant="secondary" className="mt-6 w-full">
            <a href={campaignDetailsPath(initial.campaignId)}>Back to campaign</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold">Check your phone</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a payment request via {providerLabel(initial.method, initial.provider)}. Enter your
          mobile money PIN on your phone to approve.
        </p>

        <div className="mt-6 rounded-lg bg-muted/60 p-5">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">
            {formatTZS(initial.amount)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{initial.campaignTitle}</p>
        </div>

        <p
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Waiting for confirmation…
        </p>
      </div>
    </div>
  )
}

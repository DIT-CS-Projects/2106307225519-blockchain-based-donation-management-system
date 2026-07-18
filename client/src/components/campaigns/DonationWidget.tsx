import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatTZS } from '@/utils/format'
import { CURRENCY, MIN_DONATION_TZS, PAYMENT_METHODS } from '@/constants/config'
import type { PaymentMethodKey } from '@/constants/config'
import { ROUTES, campaignDetailsPath } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { createPaymentSession } from '@/services/payments'
import { toApiError } from '@/services/api'
import { cn } from '@/lib/utils'

const PRESET_AMOUNTS = [5_000, 10_000, 25_000, 50_000]

interface DonationWidgetProps {
  campaignId: number
  /** Whether the campaign can currently accept donations (active + in window). */
  canDonate: boolean
  /** Amount carried back from the login redirect, prefilled on return. */
  initialAmount?: number
}

/**
 * Amount and payment-method selector for a campaign. Anyone can choose an
 * amount; a logged-out donor is routed to sign in and returned here with the
 * amount preserved (decision: login required to donate). Authenticated donors
 * get a checkout session and are redirected to the payment page.
 */
export function DonationWidget({ campaignId, canDonate, initialAmount }: DonationWidgetProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const presetMatch = initialAmount && PRESET_AMOUNTS.includes(initialAmount)
  const [amount, setAmount] = useState<number | null>(initialAmount ?? 10_000)
  const [custom, setCustom] = useState(initialAmount && !presetMatch ? String(initialAmount) : '')
  const [method, setMethod] = useState<PaymentMethodKey>('mobile_money')
  const [provider, setProvider] = useState<string>(PAYMENT_METHODS[0].providers[0].key)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const belowMinimum = amount !== null && amount < MIN_DONATION_TZS
  const providers = PAYMENT_METHODS.find((m) => m.key === method)?.providers ?? []

  const selectPreset = (value: number) => {
    setAmount(value)
    setCustom('')
  }

  const onCustomChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '')
    setCustom(digits)
    setAmount(digits ? Number(digits) : null)
  }

  const changeMethod = (next: PaymentMethodKey) => {
    setMethod(next)
    const first = PAYMENT_METHODS.find((m) => m.key === next)?.providers[0]?.key
    if (first) setProvider(first)
  }

  const submit = async () => {
    if (amount === null || belowMinimum) return

    if (!isAuthenticated) {
      navigate(ROUTES.login, {
        state: {
          from: { pathname: campaignDetailsPath(campaignId), search: `?donate=${amount}` },
          notice: 'Sign in to complete your donation. Your amount is saved.',
        },
      })
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const session = await createPaymentSession({ campaignId, amount, method, provider })
      const url = new URL(session.checkoutUrl)
      if (url.origin === window.location.origin) {
        navigate(`${url.pathname}${url.search}`)
      } else {
        window.location.assign(session.checkoutUrl)
      }
    } catch (err) {
      setError(toApiError(err).message)
      setSubmitting(false)
    }
  }

  if (!canDonate) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-2xl font-semibold">Make a donation</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This campaign is no longer accepting donations. Browse other campaigns that still need
          support.
        </p>
        <Button asChild variant="secondary" className="mt-5 w-full">
          <a href={ROUTES.campaigns}>Browse campaigns</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-semibold">Make a donation</h2>

      <fieldset className="mt-5" disabled={submitting}>
        <legend className="sr-only">Choose an amount</legend>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={amount === value && custom === ''}
              onClick={() => selectPreset(value)}
              className={cn(
                'h-11 rounded-md border text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                amount === value && custom === ''
                  ? 'border-transparent bg-secondary text-secondary-foreground'
                  : 'border-border text-foreground hover:bg-muted',
              )}
            >
              {formatTZS(value)}
            </button>
          ))}
        </div>

        <label htmlFor="custom-amount" className="mt-4 block text-sm font-medium">
          Or enter an amount
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{CURRENCY}</span>
          <Input
            id="custom-amount"
            inputMode="numeric"
            value={custom}
            onChange={(event) => onCustomChange(event.target.value)}
            placeholder="Custom amount"
            aria-describedby={belowMinimum ? 'amount-error' : undefined}
          />
        </div>
        {belowMinimum && (
          <p id="amount-error" className="mt-2 text-sm text-destructive">
            Minimum donation is {formatTZS(MIN_DONATION_TZS)}.
          </p>
        )}

        <label htmlFor="payment-method" className="mt-5 block text-sm font-medium">
          Payment method
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={method === option.key}
              onClick={() => changeMethod(option.key)}
              className={cn(
                'h-11 rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                method === option.key
                  ? 'border-transparent bg-secondary text-secondary-foreground'
                  : 'border-border text-foreground hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label htmlFor="payment-provider" className="mt-4 block text-sm font-medium">
          Provider
        </label>
        <Select
          id="payment-provider"
          className="mt-1.5"
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
        >
          {providers.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </Select>
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={submit}
        disabled={submitting || amount === null || belowMinimum}
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Starting payment…
          </>
        ) : (
          <>
            Continue to payment
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Secured payment · receipt and proof issued on completion
      </p>
    </div>
  )
}

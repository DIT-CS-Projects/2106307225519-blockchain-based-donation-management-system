import { useState } from 'react'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatTZS } from '@/utils/format'
import { CURRENCY, MIN_DONATION_TZS } from '@/constants/config'
import { cn } from '@/lib/utils'

const PRESET_AMOUNTS = [5_000, 10_000, 25_000, 50_000]

interface DonationWidgetProps {
  disabled?: boolean
}

/**
 * Amount selector for a campaign. Payments arrive in Stage 4; for now the
 * control validates input and explains that giving opens soon rather than
 * pretending to start a session.
 */
export function DonationWidget({ disabled = false }: DonationWidgetProps) {
  const [amount, setAmount] = useState<number | null>(10_000)
  const [custom, setCustom] = useState('')

  const belowMinimum = amount !== null && amount < MIN_DONATION_TZS

  const selectPreset = (value: number) => {
    setAmount(value)
    setCustom('')
  }

  const onCustomChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '')
    setCustom(digits)
    setAmount(digits ? Number(digits) : null)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-semibold">Make a donation</h2>

      <fieldset className="mt-5" disabled={disabled}>
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
      </fieldset>

      <Button className="mt-6 w-full" size="lg" disabled={disabled || amount === null || belowMinimum}>
        {disabled ? 'Donations open soon' : 'Continue to payment'}
        {!disabled && <ArrowRight aria-hidden="true" />}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Secured payment · receipt and proof issued on completion
      </p>
    </div>
  )
}

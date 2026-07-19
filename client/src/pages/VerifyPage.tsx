import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, ExternalLink, Loader2, SearchX, ShieldCheck } from 'lucide-react'
import { m, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyReceipt, type PublicVerification } from '@/services/verify'
import { toApiError } from '@/services/api'
import { campaignDetailsPath } from '@/constants/routes'
import { formatDate, formatTZS } from '@/utils/format'
import { blockExplorerUrl } from '@/utils/blockchain'

type Phase = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

/**
 * Public transparency lookup: anyone can confirm a donation by receipt
 * number, no account required (pages/public-verification.md). Never displays
 * donor names or contact details.
 */
export function VerifyPage() {
  const { receiptNumber: routeReceiptNumber } = useParams()
  const [query, setQuery] = useState(routeReceiptNumber ?? '')
  const [phase, setPhase] = useState<Phase>(routeReceiptNumber ? 'loading' : 'idle')
  const [result, setResult] = useState<PublicVerification | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  const applyResult = (data: PublicVerification) => {
    setResult(data)
    setPhase('found')
  }

  const applyError = (error: unknown) => {
    const apiError = toApiError(error)
    if (apiError.status === 404) {
      setPhase('not_found')
    } else {
      setErrorMessage(apiError.message)
      setPhase('error')
    }
  }

  // Deep link (/verify/:receiptNumber): fetch once on mount, mirroring
  // useFetch's pattern so state updates happen inside the promise callbacks
  // rather than synchronously in the effect body.
  useEffect(() => {
    if (!routeReceiptNumber) return
    let cancelled = false
    verifyReceipt(routeReceiptNumber.trim())
      .then((data) => {
        if (!cancelled) applyResult(data)
      })
      .catch((error: unknown) => {
        if (!cancelled) applyError(error)
      })
    return () => {
      cancelled = true
    }
  }, [routeReceiptNumber])

  const runLookup = async (receiptNumber: string) => {
    const trimmed = receiptNumber.trim()
    if (!trimmed) return

    setPhase('loading')
    setResult(null)
    setErrorMessage(null)
    try {
      applyResult(await verifyReceipt(trimmed))
    } catch (error) {
      applyError(error)
    }
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void runLookup(query)
  }

  const explorerUrl = result ? blockExplorerUrl(result.network, result.txHash) : null

  return (
    <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Public verification
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Verify a donation</h1>
        <p className="mt-3 text-muted-foreground">
          Enter a receipt number to confirm it independently. No account needed.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="receipt-lookup" className="sr-only">
          Receipt number
        </label>
        <Input
          id="receipt-lookup"
          value={query}
          onChange={(event) => setQuery(event.target.value.toUpperCase())}
          placeholder="e.g. RCP-2026-A7F3K9"
          className="h-12 text-base sm:flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="lg" disabled={phase === 'loading' || !query.trim()}>
          {phase === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Verifying…
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </form>

      <div className="mt-10">
        {phase === 'idle' && (
          <p className="text-center text-sm text-muted-foreground">
            Every receipt from Changia carries a unique number like this one.
          </p>
        )}

        {phase === 'not_found' && (
          <ResultShell reduceMotion={!!reduceMotion}>
            <div className="flex flex-col items-center gap-3 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">No verified record found for this receipt</p>
              <p className="text-sm text-muted-foreground">
                Double-check the receipt number and try again.
              </p>
            </div>
          </ResultShell>
        )}

        {phase === 'error' && (
          <ResultShell reduceMotion={!!reduceMotion}>
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="secondary" size="sm" onClick={() => void runLookup(query)}>
                Try again
              </Button>
            </div>
          </ResultShell>
        )}

        {phase === 'found' && result && (
          <ResultShell reduceMotion={!!reduceMotion}>
            <div className="flex items-center justify-between gap-3">
              <span
                className={
                  result.status === 'verified'
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
                    : 'inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'
                }
              >
                {result.status === 'verified' ? (
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <Clock className="size-3.5" aria-hidden="true" />
                )}
                {result.status === 'verified' ? 'Verified on-chain' : 'Recorded, proof pending'}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Donation
              </span>
            </div>

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Campaign</dt>
                <dd className="mt-0.5 font-medium">
                  <Link to={campaignDetailsPath(result.campaignId)} className="hover:underline">
                    {result.campaignTitle}
                  </Link>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Amount</dt>
                  <dd className="mt-0.5 font-display text-2xl font-semibold tabular-nums">
                    {formatTZS(result.amount)}
                  </dd>
                </div>
                <div className="text-right">
                  <dt className="text-sm text-muted-foreground">Date</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(result.createdAt)}</dd>
                </div>
              </div>
              {result.status === 'verified' && result.txHash && (
                <div>
                  <dt className="text-sm text-muted-foreground">Transaction hash</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs">
                    {explorerUrl ? (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-primary hover:underline"
                      >
                        View on block explorer
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      result.txHash
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {result.status === 'pending' && (
              <p className="mt-6 text-sm text-muted-foreground">
                This donation is recorded and its blockchain proof is being prepared. Check back
                shortly.
              </p>
            )}
          </ResultShell>
        )}
      </div>
    </div>
  )
}

function ResultShell({
  children,
  reduceMotion,
}: {
  children: React.ReactNode
  reduceMotion: boolean
}) {
  return (
    <m.div
      initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      {children}
    </m.div>
  )
}

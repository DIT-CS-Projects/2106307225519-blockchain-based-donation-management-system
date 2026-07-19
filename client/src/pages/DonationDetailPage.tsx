import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VerificationBadge } from '@/components/donations/VerificationBadge'
import { ReceiptButton } from '@/components/donations/ReceiptButton'
import { useFetch } from '@/hooks/useFetch'
import { getDonation, type ProofStatus } from '@/services/donations'
import { ROUTES, campaignDetailsPath, verifyReceiptPath } from '@/constants/routes'
import { formatDate, formatTZS } from '@/utils/format'
import { blockExplorerUrl } from '@/utils/blockchain'

const PROOF_MESSAGE: Record<ProofStatus, string> = {
  pending:
    'Your donation is recorded. Its permanent blockchain proof is being prepared and will appear here once confirmed.',
  confirmed:
    'This donation is permanently recorded on the blockchain. Anyone can verify it independently.',
  failed:
    'The blockchain proof could not be recorded. Your donation is safe and our team has been notified.',
}

export function DonationDetailPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const justPaid = searchParams.get('status') === 'success'

  const fetcher = useCallback(() => getDonation(id), [id])
  const { data: donation, error, loading, retry } = useFetch(fetcher)

  if (loading) return <DonationDetailSkeleton />

  if (error || !donation) {
    const notFound = error?.status === 404
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">
          {notFound ? 'Donation not found' : "This donation couldn't be loaded"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {notFound
            ? 'It may belong to a different account.'
            : 'Check your connection and try again.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {!notFound && (
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          )}
          <Button asChild>
            <Link to={ROUTES.donations}>My donations</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
      <Link
        to={ROUTES.donations}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        My donations
      </Link>

      {justPaid && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Thank you. Your donation is complete.</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              A receipt is ready below, and your blockchain proof is on its way.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Donation to</p>
            <h1 className="mt-1 font-display text-2xl font-semibold leading-snug">
              <Link to={campaignDetailsPath(donation.campaignId)} className="hover:underline">
                {donation.campaignTitle}
              </Link>
            </h1>
          </div>
          <VerificationBadge status={donation.blockchain.status} />
        </div>

        <p className="mt-6 font-display text-4xl font-bold tabular-nums">
          {formatTZS(donation.amount)}
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Detail term="Date" value={formatDate(donation.createdAt)} />
          <div>
            <dt className="text-sm text-muted-foreground">Receipt number</dt>
            <dd className="mt-0.5 flex items-center gap-2">
              <span className="font-medium tabular-nums text-foreground">
                {donation.receiptNumber}
              </span>
              <Link
                to={verifyReceiptPath(donation.receiptNumber)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Verify publicly
              </Link>
            </dd>
          </div>
          <Detail term="Payment reference" value={donation.paymentReference} />
          <Detail term="Payment status" value="Completed" />
        </dl>

        <div className="mt-8 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Blockchain proof</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {PROOF_MESSAGE[donation.blockchain.status]}
          </p>
          {donation.blockchain.txHash &&
            (() => {
              const explorerUrl = blockExplorerUrl(
                donation.blockchain.network,
                donation.blockchain.txHash,
              )
              return explorerUrl ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  View transaction
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : (
                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                  {donation.blockchain.txHash}
                </p>
              )
            })()}
        </div>

        <div className="mt-8">
          <ReceiptButton
            donationId={donation.id}
            receiptNumber={donation.receiptNumber}
            variant="primary"
          />
        </div>
      </div>
    </div>
  )
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="mt-0.5 font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  )
}

function DonationDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
      <Skeleton className="h-4 w-32" />
      <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-2/3" />
        <Skeleton className="mt-6 h-10 w-40" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-8 h-20 w-full" />
        <Skeleton className="mt-8 h-12 w-44" />
      </div>
    </div>
  )
}

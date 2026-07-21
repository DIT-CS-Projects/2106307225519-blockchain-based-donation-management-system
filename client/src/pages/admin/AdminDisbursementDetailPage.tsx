import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { toApiError } from '@/services/api'
import { approveDisbursement, getDisbursement, rejectDisbursement } from '@/services/disbursements'
import { campaignDetailsPath, ROUTES } from '@/constants/routes'
import { formatDate, formatTZS } from '@/utils/format'
import { blockExplorerUrl } from '@/utils/blockchain'

export function AdminDisbursementDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [busy, setBusy] = useState(false)

  const fetcher = useCallback(() => getDisbursement(Number(id)), [id])
  const { data, error, loading, retry } = useFetch(fetcher)

  const onApprove = async () => {
    setBusy(true)
    try {
      await approveDisbursement(Number(id))
      toast.success('Disbursement approved')
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  const onReject = async () => {
    if (!rejectReason.trim()) return
    setBusy(true)
    try {
      await rejectDisbursement(Number(id), rejectReason)
      toast.success('Disbursement rejected')
      setShowReject(false)
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />

  if (error || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">Could not load this disbursement.</p>
        <Button variant="secondary" className="mt-4" onClick={retry}>
          Try again
        </Button>
      </div>
    )
  }

  const canDecide = data.status === 'pending_approval' && data.initiatedBy !== user?.id
  const isSelfInitiated = data.status === 'pending_approval' && data.initiatedBy === user?.id
  const explorerUrl = blockExplorerUrl(data.blockchain.network, data.blockchain.txHash)

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={ROUTES.adminDisbursements}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Disbursements
      </Link>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Disbursement to</p>
            <h1 className="mt-1 font-display text-2xl font-semibold">{data.beneficiaryName}</h1>
            <Link to={campaignDetailsPath(data.campaignId)} className="text-sm text-primary hover:underline">
              {data.campaignTitle}
            </Link>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">
            {data.status.replace('_', ' ')}
          </span>
        </div>

        <p className="mt-6 font-display text-3xl font-bold tabular-nums">{formatTZS(data.amount)}</p>
        <p className="mt-2 text-sm text-muted-foreground">{data.purpose}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Initiated by</dt>
            <dd className="mt-0.5 font-medium">{data.initiatedByName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Initiated</dt>
            <dd className="mt-0.5 font-medium">{formatDate(data.createdAt)}</dd>
          </div>
          {data.completedAt && (
            <div>
              <dt className="text-sm text-muted-foreground">Completed</dt>
              <dd className="mt-0.5 font-medium">{formatDate(data.completedAt)}</dd>
            </div>
          )}
          {data.payoutReference && (
            <div>
              <dt className="text-sm text-muted-foreground">Payout reference</dt>
              <dd className="mt-0.5 font-medium">{data.payoutReference}</dd>
            </div>
          )}
        </dl>

        {data.rejectionReason && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Rejected</p>
            <p className="mt-1 text-muted-foreground">{data.rejectionReason}</p>
          </div>
        )}

        {data.status === 'completed' && (
          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium">Blockchain proof</p>
            <p className="mt-1 text-sm text-muted-foreground capitalize">{data.blockchain.status}</p>
            {data.blockchain.txHash &&
              (explorerUrl ? (
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
                  {data.blockchain.txHash}
                </p>
              ))}
          </div>
        )}

        {data.approvals.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium">Approval history</p>
            <ul className="mt-2 space-y-2">
              {data.approvals.map((a) => (
                <li key={a.id} className="text-sm text-muted-foreground">
                  {a.admin} {a.decision} on {formatDate(a.createdAt)}
                  {a.reason && ` — ${a.reason}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isSelfInitiated && (
          <p className="mt-6 text-sm text-muted-foreground">
            Awaiting approval from a different administrator. You cannot approve your own disbursement.
          </p>
        )}

        {canDecide && (
          <div className="mt-6 border-t border-border pt-6">
            {!showReject ? (
              <div className="flex gap-3">
                <Button onClick={() => void onApprove()} disabled={busy}>
                  Approve
                </Button>
                <Button variant="secondary" onClick={() => setShowReject(true)} disabled={busy}>
                  Reject
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                <Textarea
                  placeholder="Reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => void onReject()} disabled={busy || !rejectReason.trim()}>
                    Confirm rejection
                  </Button>
                  <Button variant="ghost" onClick={() => setShowReject(false)} disabled={busy}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

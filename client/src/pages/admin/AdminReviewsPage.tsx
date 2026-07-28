import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import {
  approveCampaign,
  getCampaignsAdmin,
  rejectCampaign,
} from '@/services/adminCampaigns'
import { formatTZS } from '@/utils/format'
import { ROUTES } from '@/constants/routes'

/**
 * Administrator campaign review queue (Decision 020). Fundraiser account
 * approvals live on the dedicated Fundraisers page (Decision 024).
 */
export function AdminReviewsPage() {
  const campaigns = useFetch(
    useCallback(() => getCampaignsAdmin({ status: 'pending_review', limit: 50 }), []),
  )

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          Approve campaigns before they go live. New fundraisers are approved on the{' '}
          <Link to={ROUTES.adminFundraisers} className="text-primary hover:underline">
            Fundraisers
          </Link>{' '}
          page.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold">Campaigns awaiting review</h2>
        {campaigns.loading && <Skeleton className="mt-4 h-40 w-full" />}
        {!campaigns.loading && campaigns.data && (
          <div className="mt-4 grid gap-3">
            {campaigns.data.items.length === 0 && <EmptyRow label="No campaigns awaiting review." />}
            {campaigns.data.items.map((c) => (
              <ReviewCard
                key={c.id}
                title={c.title}
                subtitle={`${c.category} · target ${formatTZS(c.targetAmount)}`}
                meta={c.ownerName ? `By ${c.ownerName}` : undefined}
                onApprove={async () => {
                  await approveCampaign(c.id)
                }}
                onReject={async (reason) => {
                  await rejectCampaign(c.id, reason)
                }}
                onChanged={campaigns.retry}
              >
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </ReviewCard>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {label}
    </p>
  )
}

interface ReviewCardProps {
  title: string
  subtitle: string
  meta?: string
  children: React.ReactNode
  onApprove: () => Promise<void>
  onReject: (reason: string) => Promise<void>
  onChanged: () => void
}

function ReviewCard({ title, subtitle, meta, children, onApprove, onReject, onChanged }: ReviewCardProps) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const approve = async () => {
    setBusy(true)
    try {
      await onApprove()
      toast.success('Approved')
      onChanged()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  const reject = async () => {
    if (reason.trim().length < 3) {
      toast.error('Enter a reason')
      return
    }
    setBusy(true)
    try {
      await onReject(reason.trim())
      toast.success('Rejected')
      onChanged()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      </div>
      <div className="mt-3">{children}</div>

      {rejecting ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            placeholder="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button variant="danger" onClick={() => void reject()} disabled={busy}>
            Confirm reject
          </Button>
          <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <Button onClick={() => void approve()} disabled={busy}>
            Approve
          </Button>
          <Button variant="secondary" onClick={() => setRejecting(true)} disabled={busy}>
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

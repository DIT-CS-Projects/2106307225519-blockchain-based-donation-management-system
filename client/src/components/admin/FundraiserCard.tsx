import { useState } from 'react'
import toast from 'react-hot-toast'
import { HandCoins, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StatusBadge, type StatusTone } from '@/components/shared/StatusBadge'
import { toApiError } from '@/services/api'
import {
  approveFundraiser,
  rejectFundraiser,
  updateUserStatus,
  type AdminFundraiser,
  type FundraiserApplicationStatus,
  type UserStatus,
} from '@/services/admin'
import { formatDate, formatTZS } from '@/utils/format'

const ACCOUNT_STATUS_OPTIONS: UserStatus[] = ['active', 'suspended', 'deactivated']

function applicationTone(status: FundraiserApplicationStatus): StatusTone {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

/** One fundraiser in the admin directory: identity, totals, and review controls. */
export function FundraiserCard({
  fundraiser,
  onChanged,
}: {
  fundraiser: AdminFundraiser
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      onChanged()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  const reject = () => {
    if (reason.trim().length < 3) {
      toast.error('Enter a reason')
      return
    }
    void run(() => rejectFundraiser(fundraiser.applicationId, reason.trim()), 'Fundraiser rejected')
  }

  const isPending = fundraiser.applicationStatus === 'pending'

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{fundraiser.displayName}</h3>
            <StatusBadge
              label={fundraiser.applicationStatus}
              tone={applicationTone(fundraiser.applicationStatus)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {fundraiser.fullName} · {fundraiser.email}
          </p>
          <p className="text-sm text-muted-foreground">{fundraiser.phone}</p>
        </div>
        <p className="text-xs text-muted-foreground">Joined {formatDate(fundraiser.joinedAt)}</p>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{fundraiser.causeDescription}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        ID reference: {fundraiser.identityReference}
      </p>
      {fundraiser.applicationStatus === 'rejected' && fundraiser.decisionReason && (
        <p className="mt-1 text-xs text-destructive">Reason: {fundraiser.decisionReason}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Megaphone className="size-4" aria-hidden="true" />
          {fundraiser.campaignsCount} campaign{fundraiser.campaignsCount === 1 ? '' : 's'}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <HandCoins className="size-4" aria-hidden="true" />
          {formatTZS(fundraiser.totalRaised)} raised
        </span>
      </div>

      {rejecting ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            placeholder="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button variant="danger" onClick={reject} disabled={busy}>
            Confirm reject
          </Button>
          <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isPending && (
            <>
              <Button
                onClick={() =>
                  void run(() => approveFundraiser(fundraiser.applicationId), 'Fundraiser approved')
                }
                disabled={busy}
              >
                Approve
              </Button>
              <Button variant="secondary" onClick={() => setRejecting(true)} disabled={busy}>
                Reject
              </Button>
            </>
          )}
          <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            Account
            <Select
              className="w-36"
              value={fundraiser.accountStatus}
              disabled={busy}
              onChange={(e) => {
                const next = e.target.value as UserStatus
                void run(async () => {
                  await updateUserStatus(fundraiser.userId, next)
                }, 'Account status updated')
              }}
            >
              {ACCOUNT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      )}
    </div>
  )
}

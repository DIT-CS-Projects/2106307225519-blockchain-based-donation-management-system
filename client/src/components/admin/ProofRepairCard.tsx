import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link2Off, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toApiError } from '@/services/api'
import { repairBlockchainProofs, type ProofRepairResult } from '@/services/admin'

/**
 * Re-records donation proofs missing from the chain. Recording needs the
 * contract owner's wallet, which only the server holds, so the repair runs
 * there and this is the trigger.
 */
export function ProofRepairCard() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ProofRepairResult | null>(null)

  const onRun = async () => {
    setRunning(true)
    try {
      const outcome = await repairBlockchainProofs()
      setResult(outcome)
      if (outcome.missing === 0) {
        toast.success('Every donation already has a proof')
      } else if (outcome.stillMissing === 0) {
        toast.success(`Recorded ${outcome.recorded} proof${outcome.recorded === 1 ? '' : 's'}`)
      } else {
        toast.error(`${outcome.recorded} recorded, ${outcome.stillMissing} still missing`)
      }
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Link2Off className="size-4 text-muted-foreground" aria-hidden="true" />
            Blockchain proof repair
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Records an on-chain proof for any donation missing one: donations made before the
            contract existed, ones whose write failed, and ones proved against a chain no longer in
            use. Safe to run more than once.
          </p>
        </div>
        <Button onClick={() => void onRun()} disabled={running}>
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Recording…
            </>
          ) : (
            'Repair proofs'
          )}
        </Button>
      </div>

      {result && (
        <p className="mt-4 border-t border-border pt-4 text-sm" role="status">
          {result.missing === 0 ? (
            <span className="text-muted-foreground">
              Nothing to repair. Every donation has a proof on {result.network}.
            </span>
          ) : (
            <>
              <span className="font-medium">
                {result.recorded} of {result.missing} recorded on {result.network}.
              </span>{' '}
              {result.stillMissing > 0 && (
                <span className="text-destructive">
                  {result.stillMissing} still missing, check the server logs.
                </span>
              )}
            </>
          )}
        </p>
      )}
    </section>
  )
}

import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import { downloadReport, getReport, type ExportFormat, type ReportName } from '@/services/reports'

const REPORTS: { key: ReportName; label: string }[] = [
  { key: 'donations', label: 'Donation Report' },
  { key: 'campaigns', label: 'Campaign Report' },
  { key: 'beneficiaries', label: 'Beneficiary Report' },
  { key: 'disbursements', label: 'Disbursement Report' },
  { key: 'blockchain', label: 'Blockchain Report' },
]

const FORMATS: ExportFormat[] = ['csv', 'excel', 'pdf']

function summaryLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

export function AdminReportsPage() {
  const [active, setActive] = useState<ReportName>('donations')
  const [downloading, setDownloading] = useState<ExportFormat | null>(null)

  const fetcher = useCallback(() => getReport(active), [active])
  const { data, error, loading, retry } = useFetch(fetcher)

  const onDownload = async (format: ExportFormat) => {
    setDownloading(format)
    try {
      await downloadReport(active, format)
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Reports</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setActive(r.key)}
            className={
              active === r.key
                ? 'rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground'
                : 'rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted'
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <Skeleton className="mt-6 h-80 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load this report.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(data.summary)
              .filter(([, value]) => typeof value !== 'string' || value.length < 40)
              .map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{summaryLabel(key)}</p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums">{String(value)}</p>
                </div>
              ))}
          </div>

          <div className="mt-6 flex gap-2">
            {FORMATS.map((format) => (
              <Button
                key={format}
                variant="secondary"
                size="sm"
                disabled={downloading !== null}
                onClick={() => void onDownload(format)}
              >
                {downloading === format ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                Export {format.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  {data.columns.map((col) => (
                    <th key={col.key} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    {data.columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap px-4 py-3">
                        {String(row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.rows.length > 100 && (
              <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                Showing 100 of {data.rows.length} rows. Export for the full dataset.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

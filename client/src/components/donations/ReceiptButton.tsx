import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { downloadReceipt } from '@/services/donations'
import { toApiError } from '@/services/api'

interface ReceiptButtonProps {
  donationId: number
  receiptNumber: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  label?: string
}

/** Downloads a donation's PDF receipt (auth header attached by the service). */
export function ReceiptButton({
  donationId,
  receiptNumber,
  variant = 'secondary',
  size,
  className,
  label = 'Download receipt',
}: ReceiptButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const blob = await downloadReceipt(donationId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${receiptNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Defer revocation: some browsers process the download asynchronously,
      // and revoking immediately can cancel it before the download starts.
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button variant={variant} size={size} onClick={onClick} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Preparing…
          </>
        ) : (
          <>
            <Download aria-hidden="true" /> {label}
          </>
        )}
      </Button>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

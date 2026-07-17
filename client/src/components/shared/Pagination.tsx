import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** Numbered pagination with prev/next. Hidden when there is a single page. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>

      {pages.map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'primary' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn('tabular-nums', item !== page && 'text-muted-foreground')}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}

/** First, last, and a window around the current page, with gaps collapsed. */
function pageWindow(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result: Array<number | 'gap'> = []
  let previous = 0
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push('gap')
    result.push(p)
    previous = p
  }
  return result
}

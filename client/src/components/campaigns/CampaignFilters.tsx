import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CAMPAIGN_CATEGORIES, type CampaignCategory } from '@/constants/config'
import type { CampaignSort } from '@/services/campaigns'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: Array<{ value: CampaignSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'endingSoon', label: 'Ending soon' },
  { value: 'mostFunded', label: 'Most funded' },
  { value: 'alphabetical', label: 'A–Z' },
]

interface CampaignFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: CampaignCategory | null
  onCategoryChange: (value: CampaignCategory | null) => void
  sort: CampaignSort
  onSortChange: (value: CampaignSort) => void
}

/** Search, category chips, and sort control for the campaign list. */
export function CampaignFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: CampaignFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search campaigns"
            aria-label="Search campaigns"
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort by
          <Select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as CampaignSort)}
            aria-label="Sort campaigns"
            className="w-40"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        <CategoryChip label="All" active={category === null} onClick={() => onCategoryChange(null)} />
        {CAMPAIGN_CATEGORIES.map((item) => (
          <CategoryChip
            key={item}
            label={item}
            active={category === item}
            onClick={() => onCategoryChange(item)}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-9 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border-transparent bg-secondary text-secondary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

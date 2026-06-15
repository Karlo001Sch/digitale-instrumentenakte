'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { INSTRUMENT_STATUS_LABELS } from '@/lib/status'

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface InstrumentFiltersProps {
  categories: Category[]
  brands: Brand[]
  currentSearch?: string
  currentStatus?: string
  currentCategoryId?: string
  currentBrandId?: string
}

export function InstrumentFilters({
  categories,
  brands,
  currentSearch,
  currentStatus,
  currentCategoryId,
  currentBrandId,
}: InstrumentFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters = currentSearch || currentStatus || currentCategoryId || currentBrandId

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Suche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Suche nach ID, Seriennummer, Modell..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const val = e.target.value
              if (val.length === 0 || val.length >= 2) {
                updateFilter('search', val || undefined)
              }
            }}
            className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Status Filter */}
        <select
          value={currentStatus ?? ''}
          onChange={(e) => updateFilter('status', e.target.value || undefined)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48"
        >
          <option value="">Alle Status</option>
          {Object.entries(INSTRUMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Kategorie Filter */}
        <select
          value={currentCategoryId ?? ''}
          onChange={(e) => updateFilter('categoryId', e.target.value || undefined)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Marke Filter */}
        <select
          value={currentBrandId ?? ''}
          onChange={(e) => updateFilter('brandId', e.target.value || undefined)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-40"
        >
          <option value="">Alle Marken</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        {/* Filter zurücksetzen */}
        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 px-3 h-10 rounded-md border border-input text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Zurücksetzen</span>
          </button>
        )}
      </div>
    </div>
  )
}

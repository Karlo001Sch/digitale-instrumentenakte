'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface RentalFiltersProps {
  currentStatus?: string
  currentPaymentMethod?: string
}

export function RentalFilters({ currentStatus, currentPaymentMethod }: RentalFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={currentStatus ?? ''}
        onChange={(e) => updateFilter('status', e.target.value || undefined)}
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Alle Status</option>
        <option value="ACTIVE">Aktiv</option>
        <option value="ENDED">Beendet</option>
        <option value="CANCELLED">Storniert</option>
      </select>
      <select
        value={currentPaymentMethod ?? ''}
        onChange={(e) => updateFilter('paymentMethod', e.target.value || undefined)}
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Alle Zahlungsarten</option>
        <option value="DIRECT_DEBIT">Abbuchung</option>
        <option value="BANK_TRANSFER">Überweisung</option>
        <option value="CASH">Bar</option>
        <option value="CARD">EC-Karte</option>
      </select>
    </div>
  )
}

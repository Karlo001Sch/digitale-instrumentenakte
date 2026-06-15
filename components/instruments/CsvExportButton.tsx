'use client'

import { Download } from 'lucide-react'

interface CsvExportButtonProps {
  search?: string
  status?: string
  categoryId?: string
  brandId?: string
}

export function CsvExportButton({ search, status, categoryId, brandId }: CsvExportButtonProps) {
  function handleExport() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (categoryId) params.set('categoryId', categoryId)
    if (brandId) params.set('brandId', brandId)

    const url = `/api/csv/instruments?${params.toString()}`
    window.location.href = url
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors"
    >
      <Download className="h-4 w-4" />
      CSV Export
    </button>
  )
}

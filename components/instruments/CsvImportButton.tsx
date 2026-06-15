'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { CsvImport } from '@/components/instruments/CsvImport'
import { useRouter } from 'next/navigation'

export function CsvImportButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleClose() {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors"
      >
        <Upload className="h-4 w-4" />
        CSV Import
      </button>
      {open && <CsvImport onClose={handleClose} />}
    </>
  )
}

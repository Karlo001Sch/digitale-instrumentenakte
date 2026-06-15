'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CHANGEABLE_STATUSES } from '@/lib/status'
import { changeInstrumentStatus } from '@/components/instruments/statusActions'

interface ChangeStatusDialogProps {
  instrumentId: string
  currentStatus: string
  isRented: boolean
  activeRentalId?: string
}

export function ChangeStatusDialog({
  instrumentId,
  currentStatus,
  isRented,
  activeRentalId,
}: ChangeStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isOverhaul = newStatus === 'OVERHAUL_EXTERNAL'

  function handleClose() {
    setOpen(false)
    setNewStatus('')
    setReason('')
    setError(null)
    setLoading(false)
  }

  async function handleSubmit() {
    if (!newStatus) {
      setError('Bitte einen Status auswählen.')
      return
    }
    if (isOverhaul && !reason.trim()) {
      setError('Bei Generalüberholung ist ein Grund Pflicht.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await changeInstrumentStatus({
      instrumentId,
      newStatus,
      reason: reason.trim() || undefined,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    handleClose()
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors"
      >
        Status ändern
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Status ändern</h2>
          <p className="text-sm text-muted-foreground">
            Aktuell: <strong>{currentStatus}</strong>
          </p>
        </div>

        {/* Warnung bei aktivem Vertrag */}
        {isRented && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-3 space-y-2">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠ Es läuft ein aktiver Mietvertrag.
            </p>
            <p className="text-xs text-yellow-700">
              Du kannst den Status trotzdem ändern, oder den Vertrag zuerst beenden.
            </p>
            {activeRentalId && (
              <a
                href={`/rentals/${activeRentalId}`}
                className="text-xs text-yellow-800 underline hover:text-yellow-900"
                onClick={handleClose}
              >
                → Zum Mietvertrag (Rückgabe erfassen)
              </a>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Neuer Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">– Status wählen –</option>
              {CHANGEABLE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Grund / Notiz {isOverhaul && <span className="text-destructive">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isOverhaul ? 'Pflichtangabe bei Generalüberholung...' : 'Optional...'}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !newStatus}
            className="flex-1 h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Wird gespeichert...' : 'Status speichern'}
          </button>
          <button
            onClick={handleClose}
            className="h-10 px-4 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </>
  )
}

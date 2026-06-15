'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processReturn } from '@/components/rentals/returnActions'
import { RETURN_TARGET_STATUSES } from '@/lib/status'

interface ReturnFormProps {
  rentalId: string
  depositAmount: number
  instrumentId: string
}

export function ReturnForm({ rentalId, depositAmount, instrumentId }: ReturnFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [targetStatus, setTargetStatus] = useState('AVAILABLE')
  const [depositReturned, setDepositReturned] = useState(false)
  const [depositSettled, setDepositSettled] = useState(false)

  const isOverhaul = targetStatus === 'OVERHAUL_EXTERNAL'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await processReturn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/rentals/${rentalId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="rentalId" value={rentalId} />
      <input type="hidden" name="instrumentId" value={instrumentId} />

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Rückgabedaten */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Rückgabe</h2>

        <div>
          <label className="text-sm font-medium block mb-1.5">
            Rückgabedatum <span className="text-destructive">*</span>
          </label>
          <input
            name="returnDate"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">
            Zielstatus des Instruments <span className="text-destructive">*</span>
          </label>
          <select
            name="targetStatus"
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {RETURN_TARGET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">
            Notiz zur Rückgabe {isOverhaul && <span className="text-destructive">*</span>}
          </label>
          <textarea
            name="notes"
            placeholder={isOverhaul ? 'Pflichtangabe bei Generalüberholung...' : 'Zustand bei Rückgabe, Besonderheiten...'}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>

      {/* Kaution */}
      {depositAmount > 0 && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <h2 className="font-medium text-sm">Kaution ({depositAmount.toFixed(2)} €)</h2>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="depositReturned"
              checked={depositReturned}
              onChange={(e) => {
                setDepositReturned(e.target.checked)
                if (e.target.checked) setDepositSettled(false)
              }}
              className="rounded border-input"
            />
            <span className="text-sm">Kaution zurückgegeben</span>
          </label>

          {depositReturned && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Zurückgegeben am</label>
              <input
                name="depositReturnedAt"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="depositSettled"
              checked={depositSettled}
              onChange={(e) => {
                setDepositSettled(e.target.checked)
                if (e.target.checked) setDepositReturned(false)
              }}
              className="rounded border-input"
            />
            <span className="text-sm">Kaution verrechnet (nicht zurückgegeben)</span>
          </label>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none h-10 px-6 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Wird gespeichert...' : 'Rückgabe bestätigen'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 px-4 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}

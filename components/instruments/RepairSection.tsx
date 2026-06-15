'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRepairEvent } from '@/components/instruments/repairActions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Plus } from 'lucide-react'

const REPAIR_STATUS_LABELS: Record<string, string> = {
  not_started: 'Ausstehend',
  in_progress: 'In Bearbeitung',
  done: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
}

const REPAIR_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  not_started: 'secondary',
  in_progress: 'default',
  done: 'outline',
  cancelled: 'destructive',
}

interface RepairEvent {
  id: string
  title: string
  description: string | null
  repairDate: Date
  costEstimate: unknown
  actualCost: unknown
  status: string
}

export function RepairSection({ instrumentId, repairEvents, isRented }: {
  instrumentId: string
  repairEvents: RepairEvent[]
  isRented: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('instrumentId', instrumentId)
    const result = await createRepairEvent(formData)
    if (result?.error) { setError(result.error); setLoading(false); return }
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {repairEvents.length} Ereignis{repairEvents.length !== 1 ? 'se' : ''}
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Neues Ereignis
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium block mb-1.5">Titel <span className="text-destructive">*</span></label>
              <input name="title" required placeholder="z.B. Oktavklappe reparieren"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Datum</label>
              <input name="repairDate" type="date" defaultValue={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Status</label>
              <select name="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {Object.entries(REPAIR_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Kostenschätzung (€)</label>
              <input name="costEstimate" type="number" step="0.01" min="0" placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Tatsächliche Kosten (€)</label>
              <input name="actualCost" type="number" step="0.01" min="0" placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium block mb-1.5">Beschreibung</label>
              <textarea name="description" rows={2} placeholder="Details zur Reparatur..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
            {!isRented && (
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="setInRepair" className="rounded border-input" />
                  <span className="text-sm">Instrument auf „In Reparatur" setzen</span>
                </label>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="h-9 px-4 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {repairEvents.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Keine Reparaturereignisse vorhanden.</p>
      )}

      <div className="space-y-3">
        {repairEvents.map((event) => (
          <div key={event.id} className="bg-card border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{event.title}</p>
              <Badge variant={REPAIR_STATUS_VARIANTS[event.status] ?? 'secondary'}>
                {REPAIR_STATUS_LABELS[event.status] ?? event.status}
              </Badge>
            </div>
            {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{format(new Date(event.repairDate), 'dd.MM.yyyy', { locale: de })}</span>
              {event.costEstimate ? <span>Schätzung: {Number(event.costEstimate).toFixed(2)} €</span> : null}
              {event.actualCost ? <span>Kosten: {Number(event.actualCost).toFixed(2)} €</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

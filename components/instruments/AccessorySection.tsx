'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAccessory, deleteAccessory } from '@/components/instruments/repairActions'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'

interface Accessory {
  id: string
  name: string
  description: string | null
  serialNumber: string | null
  condition: string | null
  included: boolean
}

export function AccessorySection({ instrumentId, accessories }: {
  instrumentId: string
  accessories: Accessory[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [included, setIncluded] = useState(true)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('instrumentId', instrumentId)
    formData.append('included', included ? 'true' : 'false')
    const result = await createAccessory(formData)
    if (result?.error) { setError(result.error); setLoading(false); return }
    setShowForm(false)
    setLoading(false)
    setIncluded(true)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Zubehör wirklich entfernen?')) return
    await deleteAccessory(id, instrumentId)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {accessories.length} Zubehör{accessories.length !== 1 ? 'teile' : 'teil'}
        </span>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus className="h-4 w-4" />Zubehör hinzufügen
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium block mb-1.5">Name <span className="text-destructive">*</span></label>
              <input name="name" required placeholder="z.B. Mundstück, Koffer, Reinigungsset"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Seriennummer</label>
              <input name="serialNumber" placeholder="optional"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Zustand</label>
              <input name="condition" placeholder="z.B. gut, beschädigt"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium block mb-1.5">Beschreibung</label>
              <input name="description" placeholder="optional"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={included} onChange={(e) => setIncluded(e.target.checked)} className="rounded border-input" />
                <span className="text-sm">Ist beim Instrument dabei</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? 'Speichern...' : 'Hinzufügen'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="h-9 px-4 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {accessories.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Kein Zubehör erfasst.</p>
      )}

      <div className="space-y-2">
        {accessories.map((acc) => (
          <div key={acc.id} className="bg-card border rounded-lg px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{acc.name}</p>
                <Badge variant={acc.included ? 'default' : 'destructive'}>
                  {acc.included ? 'Dabei' : 'Fehlt'}
                </Badge>
              </div>
              {acc.description && <p className="text-xs text-muted-foreground mt-0.5">{acc.description}</p>}
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                {acc.serialNumber && <span className="font-mono">{acc.serialNumber}</span>}
                {acc.condition && <span>{acc.condition}</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(acc.id)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

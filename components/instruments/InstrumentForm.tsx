'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInstrument, updateInstrument } from '@/components/instruments/actions'
import { INSTRUMENT_STATUS_LABELS } from '@/lib/status'

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

interface InstrumentFormProps {
  categories: Category[]
  brands: Brand[]
  defaultValues?: {
    id: string
    internalId: string
    label?: string | null
    categoryId?: string | null
    brandId?: string | null
    model?: string | null
    serialNumber?: string | null
    purchaseDate?: Date | null
    purchasePrice?: unknown
    currentValue?: unknown
    defaultMonthlyRent?: unknown
    defaultDeposit?: unknown
    conditionRating?: number | null
    status: string
    location?: string | null
    generalNotes?: string | null
  }
}

export function InstrumentForm({ categories, brands, defaultValues }: InstrumentFormProps) {
  const router = useRouter()
  const isEdit = !!defaultValues
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = isEdit
      ? await updateInstrument(defaultValues!.id, formData)
      : await createInstrument(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.id) {
      router.push(`/instruments/${result.id}`)
    }
  }

  const toNum = (val: unknown) => (val ? Number(val) : '')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Pflichtfelder */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Pflichtangaben</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Interne ID / Kennname <span className="text-destructive">*</span>
            </label>
            <input
              name="internalId"
              defaultValue={defaultValues?.internalId}
              placeholder="z.B. AltSax01"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wird Teil der Bankkennung (z.B. BK060626AltSax01)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Status <span className="text-destructive">*</span>
            </label>
            <select
              name="status"
              defaultValue={defaultValues?.status ?? 'AVAILABLE'}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(INSTRUMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stammdaten */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Stammdaten</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Bezeichnung</label>
            <input
              name="label"
              defaultValue={defaultValues?.label ?? ''}
              placeholder="z.B. Altsaxophon 01"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Seriennummer</label>
            <input
              name="serialNumber"
              defaultValue={defaultValues?.serialNumber ?? ''}
              placeholder="z.B. J65432"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Kategorie</label>
            <select
              name="categoryId"
              defaultValue={defaultValues?.categoryId ?? ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">– Keine –</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Marke</label>
            <select
              name="brandId"
              defaultValue={defaultValues?.brandId ?? ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">– Keine –</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Modell</label>
            <input
              name="model"
              defaultValue={defaultValues?.model ?? ''}
              placeholder="z.B. YAS-280"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Standort</label>
            <input
              name="location"
              defaultValue={defaultValues?.location ?? ''}
              placeholder="z.B. Regal A1"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Finanzen */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Finanzen</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Zeitwert (€)</label>
            <input
              name="currentValue"
              type="number"
              step="0.01"
              min="0"
              defaultValue={toNum(defaultValues?.currentValue)}
              placeholder="0.00"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Einkaufspreis (€)</label>
            <input
              name="purchasePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={toNum(defaultValues?.purchasePrice)}
              placeholder="0.00"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Standard-Monatsmiete (€)</label>
            <input
              name="defaultMonthlyRent"
              type="number"
              step="0.01"
              min="0"
              defaultValue={toNum(defaultValues?.defaultMonthlyRent)}
              placeholder="0.00"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Standard-Kaution (€)</label>
            <input
              name="defaultDeposit"
              type="number"
              step="0.01"
              min="0"
              defaultValue={toNum(defaultValues?.defaultDeposit)}
              placeholder="0.00"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Einkaufsdatum</label>
            <input
              name="purchaseDate"
              type="date"
              defaultValue={defaultValues?.purchaseDate
                ? new Date(defaultValues.purchaseDate).toISOString().split('T')[0]
                : ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Zustand (1–5)</label>
            <select
              name="conditionRating"
              defaultValue={defaultValues?.conditionRating ?? ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">– Keine Angabe –</option>
              <option value="5">5 – Sehr gut</option>
              <option value="4">4 – Gut</option>
              <option value="3">3 – Befriedigend</option>
              <option value="2">2 – Ausreichend</option>
              <option value="1">1 – Mangelhaft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notizen */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Notizen</h2>
        <textarea
          name="generalNotes"
          defaultValue={defaultValues?.generalNotes ?? ''}
          placeholder="Allgemeine Notizen zum Instrument..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none h-10 px-6 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Wird gespeichert...' : isEdit ? 'Änderungen speichern' : 'Instrument anlegen'}
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

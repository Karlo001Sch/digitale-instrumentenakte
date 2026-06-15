'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomer, updateCustomer } from '@/components/customers/customerActions'

interface CustomerFormProps {
  defaultValues?: {
    id: string
    firstName: string
    lastName: string
    street?: string | null
    postalCode?: string | null
    city?: string | null
    phone?: string | null
    email?: string | null
    customerType?: string | null
    iban?: string | null
    directDebitMandateExists: boolean
    directDebitMandateDate?: Date | null
    notes?: string | null
  }
}

export function CustomerForm({ defaultValues }: CustomerFormProps) {
  const router = useRouter()
  const isEdit = !!defaultValues
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMandate, setHasMandate] = useState(defaultValues?.directDebitMandateExists ?? false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = isEdit
      ? await updateCustomer(defaultValues!.id, formData)
      : await createCustomer(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.id) {
      router.push(`/customers/${result.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Pflichtfelder */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Name</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Vorname <span className="text-destructive">*</span>
            </label>
            <input
              name="firstName"
              defaultValue={defaultValues?.firstName}
              required
              placeholder="Max"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Nachname <span className="text-destructive">*</span>
            </label>
            <input
              name="lastName"
              defaultValue={defaultValues?.lastName}
              required
              placeholder="Mustermann"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Kontakt & Adresse</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Telefon</label>
            <input
              name="phone"
              defaultValue={defaultValues?.phone ?? ''}
              placeholder="0711 123456"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">E-Mail</label>
            <input
              name="email"
              type="email"
              defaultValue={defaultValues?.email ?? ''}
              placeholder="name@example.de"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">Straße</label>
            <input
              name="street"
              defaultValue={defaultValues?.street ?? ''}
              placeholder="Musterstraße 1"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">PLZ</label>
            <input
              name="postalCode"
              defaultValue={defaultValues?.postalCode ?? ''}
              placeholder="70173"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Ort</label>
            <input
              name="city"
              defaultValue={defaultValues?.city ?? ''}
              placeholder="Stuttgart"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Kundentyp</label>
            <input
              name="customerType"
              defaultValue={defaultValues?.customerType ?? ''}
              placeholder="z.B. Schüler, Erwachsener"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Zahlungsdaten */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Zahlungsdaten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">IBAN</label>
            <input
              name="iban"
              defaultValue={defaultValues?.iban ?? ''}
              placeholder="DE89 3704 0044 0532 0130 00"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="directDebitMandateExists"
                checked={hasMandate}
                onChange={(e) => setHasMandate(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">Einzugsermächtigung vorhanden</span>
            </label>
          </div>
          {hasMandate && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Datum Einzugsermächtigung</label>
              <input
                name="directDebitMandateDate"
                type="date"
                defaultValue={defaultValues?.directDebitMandateDate
                  ? new Date(defaultValues.directDebitMandateDate).toISOString().split('T')[0]
                  : ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notizen */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Notizen</h2>
        <textarea
          name="notes"
          defaultValue={defaultValues?.notes ?? ''}
          placeholder="Besonderheiten zum Kunden..."
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
          {loading ? 'Wird gespeichert...' : isEdit ? 'Änderungen speichern' : 'Kunde anlegen'}
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

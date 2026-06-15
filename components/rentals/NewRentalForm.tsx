'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRental } from '@/components/rentals/rentalActions'
import { SearchSelect } from '@/components/rentals/SearchSelect'

interface Instrument {
  id: string
  internalId: string
  label: string | null
  defaultMonthlyRent: unknown
  defaultDeposit: unknown
  category: { name: string } | null
  brand: { name: string } | null
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  directDebitMandateExists: boolean
}

interface NewRentalFormProps {
  instruments: Instrument[]
  customers: Customer[]
  preselectedCustomerId?: string
}

const PAYMENT_METHODS = [
  { value: 'DIRECT_DEBIT', label: 'Abbuchung (Lastschrift)' },
  { value: 'BANK_TRANSFER', label: 'Überweisung' },
  { value: 'CASH', label: 'Bar' },
  { value: 'CARD', label: 'EC-Karte' },
]

export function NewRentalForm({ instruments, customers, preselectedCustomerId }: NewRentalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId ?? '')
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('DIRECT_DEBIT')
  const [firstMonthCash, setFirstMonthCash] = useState(true)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentReference, setPaymentReference] = useState('')

  const selectedInstrument = instruments.find((i) => i.id === selectedInstrumentId)
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const instrumentOptions = instruments.map((i) => ({
    id: i.id,
    label: i.internalId,
    sublabel: [i.brand?.name, i.category?.name].filter(Boolean).join(' · '),
    meta: i.defaultMonthlyRent ? `${Number(i.defaultMonthlyRent).toFixed(2)} €` : undefined,
  }))

  const customerOptions = customers.map((c) => ({
    id: c.id,
    label: `${c.lastName}, ${c.firstName}`,
    meta: c.directDebitMandateExists ? '✓ Einzug' : undefined,
  }))

  useEffect(() => {
    if (selectedInstrument) {
      setMonthlyRent(Number(selectedInstrument.defaultMonthlyRent || 0).toFixed(2))
      setDepositAmount(Number(selectedInstrument.defaultDeposit || 0).toFixed(2))
    }
  }, [selectedInstrumentId])

  useEffect(() => {
    if (selectedCustomer && selectedInstrument && startDate) {
      const date = new Date(startDate)
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yy = String(date.getFullYear()).slice(-2)
      const firstInitial = selectedCustomer.firstName.charAt(0).toUpperCase()
      const lastInitial = selectedCustomer.lastName.charAt(0).toUpperCase()
      const cleanId = selectedInstrument.internalId.replace(/\s+/g, '')
      setPaymentReference(`${firstInitial}${lastInitial}${dd}${mm}${yy}${cleanId}`)
    } else {
      setPaymentReference('')
    }
  }, [selectedCustomerId, selectedInstrumentId, startDate])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await createRental(formData)
    if (result?.error) { setError(result.error); setLoading(false); return }
    if (result?.id) router.push(`/rentals/${result.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-3">{error}</div>
      )}

      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Vertragsparteien</h2>
        <div>
          <label className="text-sm font-medium block mb-1.5">Kunde <span className="text-destructive">*</span></label>
          <SearchSelect
            name="customerId"
            placeholder="Name suchen..."
            options={customerOptions}
            value={selectedCustomerId}
            onChange={(id) => setSelectedCustomerId(id)}
            required
          />
          {selectedCustomer && !selectedCustomer.directDebitMandateExists && paymentMethod === 'DIRECT_DEBIT' && (
            <p className="text-xs text-yellow-600 mt-1">⚠ Keine Einzugsermächtigung vorhanden.</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Instrument <span className="text-destructive">*</span></label>
          <SearchSelect
            name="instrumentId"
            placeholder="ID oder Marke suchen..."
            options={instrumentOptions}
            value={selectedInstrumentId}
            onChange={(id) => setSelectedInstrumentId(id)}
            required
          />
          {instruments.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Keine verfügbaren Instrumente.</p>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Mietdetails</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Mietbeginn <span className="text-destructive">*</span></label>
            <input name="startDate" type="date" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Monatsmiete (€) <span className="text-destructive">*</span></label>
            <input name="monthlyRent" type="number" step="0.01" min="0" value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)} required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Kaution (€)</label>
            <input name="depositAmount" type="number" step="0.01" min="0" value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Kaution erhalten am</label>
            <input name="depositReceivedAt" type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Zahlungsart</h2>
        <select name="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="firstMonthCash" checked={firstMonthCash}
            onChange={(e) => setFirstMonthCash(e.target.checked)} className="rounded border-input" />
          <span className="text-sm">Erster Monat wird bar bezahlt</span>
        </label>
        {paymentReference && (
          <div className="bg-muted rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground mb-0.5">Verwendungszweck (automatisch generiert)</p>
            <p className="font-mono text-sm font-medium">{paymentReference}</p>
          </div>
        )}
      </div>

      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Notizen</h2>
        <textarea name="notes" placeholder="Besonderheiten zum Vertrag..." rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 sm:flex-none h-10 px-6 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? 'Wird gespeichert...' : 'Mietvertrag anlegen'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="h-10 px-4 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
          Abbrechen
        </button>
      </div>
    </form>
  )
}

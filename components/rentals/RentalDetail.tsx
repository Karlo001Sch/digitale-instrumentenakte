'use client'

import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { DepositButtons } from '@/components/rentals/DepositButtons'


const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung',
  CARD: 'EC-Karte',
  UNKNOWN: 'Unbekannt',
}

interface RentalDetailProps {
  rental: {
    id: string
    startDate: Date
    endDate: Date | null
    monthlyRent: number
    depositAmount: number
    depositReceivedAt: Date | null
    depositReturnedAt: Date | null
    depositNotes: string | null
    paymentMethod: string
    paymentReference: string
    firstMonthCash: boolean
    status: string
    notes: string | null
    customer: {
      id: string
      firstName: string
      lastName: string
      street: string | null
      postalCode: string | null
      city: string | null
      phone: string | null
      email: string | null
    }
    instrument: {
      id: string
      internalId: string
      label: string | null
      serialNumber: string | null
      category: { name: string } | null
      brand: { name: string } | null
    }
    payments: {
      id: string
      dueDate: Date
      amount: number
      method: string
      status: string
      paidAt: Date | null
      paymentReference: string | null
    }[]
  }
}

export function RentalDetail({ rental }: RentalDetailProps) {
  const openPayments = rental.payments.filter((p) => p.status === 'OPEN')
  const paidPayments = rental.payments.filter((p) => p.status === 'PAID')
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/rentals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Mietverträge
      </Link>

      {/* Header */}
      <div className="bg-card border rounded-lg p-4 md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-xl font-bold">Mietvertrag</h1>
              <Badge variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {rental.status === 'ACTIVE' ? 'Aktiv' : rental.status === 'ENDED' ? 'Beendet' : 'Storniert'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{rental.paymentReference}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={`/api/pdf/rental-contract?contractId=${rental.id}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">PDF Vertrag</span>
            </a>
            {rental.status === 'ACTIVE' && (
              <Link
                href={`/rentals/${rental.id}/return`}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Rückgabe erfassen
              </Link>
            )}
          </div>
          <DepositButtons
  rentalId={rental.id}
  depositAmount={rental.depositAmount}
  depositReceivedAt={rental.depositReceivedAt}
  depositReturnedAt={rental.depositReturnedAt}
  depositNotes={rental.depositNotes}
  status={rental.status}
/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          {/* Kundendaten */}
          <div className="space-y-2">
            <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Mieter</h3>
            <Link href={`/customers/${rental.customer.id}`} className="font-medium text-primary hover:underline block">
              {rental.customer.firstName} {rental.customer.lastName}
            </Link>
            {rental.customer.street && (
              <p className="text-muted-foreground">
                {rental.customer.street}<br />
                {rental.customer.postalCode} {rental.customer.city}
              </p>
            )}
            {rental.customer.phone && (
              <a href={`tel:${rental.customer.phone}`} className="text-primary hover:underline block">
                {rental.customer.phone}
              </a>
            )}
            {rental.customer.email && (
              <a href={`mailto:${rental.customer.email}`} className="text-primary hover:underline block">
                {rental.customer.email}
              </a>
            )}
          </div>

          {/* Instrumentendaten */}
          <div className="space-y-2">
            <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Instrument</h3>
            <Link href={`/instruments/${rental.instrument.id}`} className="font-medium text-primary hover:underline block">
              {rental.instrument.internalId}
              {rental.instrument.label && ` – ${rental.instrument.label}`}
            </Link>
            {rental.instrument.category && (
              <p className="text-muted-foreground">{rental.instrument.category.name}</p>
            )}
            {rental.instrument.brand && (
              <p className="text-muted-foreground">{rental.instrument.brand.name}</p>
            )}
            {rental.instrument.serialNumber && (
              <p className="font-mono text-xs text-muted-foreground">{rental.instrument.serialNumber}</p>
            )}
          </div>
        </div>

        {/* Vertragsdetails */}
        <div className="border-t pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Mietbeginn</p>
            <p className="font-medium">{format(rental.startDate, 'dd.MM.yyyy', { locale: de })}</p>
          </div>
          {rental.endDate && (
            <div>
              <p className="text-xs text-muted-foreground">Mietende</p>
              <p className="font-medium">{format(rental.endDate, 'dd.MM.yyyy', { locale: de })}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Monatsmiete</p>
            <p className="font-medium">{rental.monthlyRent.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Zahlungsart</p>
            <p className="font-medium">{PAYMENT_METHOD_LABELS[rental.paymentMethod]}</p>
          </div>
          {rental.depositAmount > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Kaution</p>
              <p className="font-medium">{rental.depositAmount.toFixed(2)} €</p>
            </div>
          )}
          {rental.depositReceivedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Kaution erhalten</p>
              <p className="font-medium">{format(rental.depositReceivedAt, 'dd.MM.yyyy', { locale: de })}</p>
            </div>
          )}
          {rental.firstMonthCash && (
            <div>
              <p className="text-xs text-muted-foreground">1. Monat</p>
              <p className="font-medium">Bar</p>
            </div>
          )}
        </div>

        {rental.notes && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-1">Notizen</p>
            <p className="text-sm">{rental.notes}</p>
          </div>
        )}
      </div>

      {/* Zahlungsübersicht */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-medium text-sm">Zahlungen</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Bezahlt: <strong>{totalPaid.toFixed(2)} €</strong></span>
            {openPayments.length > 0 && (
              <span className="text-yellow-600">Offen: <strong>{openPayments.length}</strong></span>
            )}
          </div>
        </div>
        {rental.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">Keine Zahlungen vorhanden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Fälligkeit</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Betrag</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Art</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Bezahlt am</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rental.payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2">{format(new Date(payment.dueDate), 'dd.MM.yyyy', { locale: de })}</td>
                  <td className="px-4 py-2">{payment.amount.toFixed(2)} €</td>
                  <td className="px-4 py-2">{PAYMENT_METHOD_LABELS[payment.method]}</td>
                  <td className="px-4 py-2">
                    <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'}>
                      {payment.status === 'PAID' ? 'Bezahlt' : 'Offen'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {payment.paidAt ? format(new Date(payment.paidAt), 'dd.MM.yyyy', { locale: de }) : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

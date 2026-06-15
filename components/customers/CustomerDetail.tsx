'use client'

import Link from 'next/link'
import { ArrowLeft, Edit, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useState } from 'react'
import { NoteSection } from '@/components/instruments/NoteSection'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung',
  CARD: 'Karte',
  UNKNOWN: 'Unbekannt',
}

interface CustomerDetailProps {
  customer: {
    id: string
    firstName: string
    lastName: string
    street: string | null
    postalCode: string | null
    city: string | null
    phone: string | null
    email: string | null
    customerType: string | null
    iban: string | null
    directDebitMandateExists: boolean
    directDebitMandateDate: Date | null
    notes: string | null
    createdAt: Date
    rentals: {
      id: string
      startDate: Date
      endDate: Date | null
      monthlyRent: number
      depositAmount: number
      depositReceivedAt: Date | null
      depositReturnedAt: Date | null
      paymentMethod: string
      paymentReference: string
      status: string
      notes: string | null
      instrument: {
        id: string
        internalId: string
        label: string | null
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
      }[]
    }[]
    notesList: {
      id: string
      noteType: string
      content: string
      createdAt: Date
    }[]
  }
  rentCreditAmount: number
}

const TABS = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'rentals', label: 'Mietverträge' },
  { id: 'payments', label: 'Zahlungen' },
  { id: 'notes', label: 'Notizen' },
]

export function CustomerDetail({ customer, rentCreditAmount }: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const activeRentals = customer.rentals.filter((r) => r.status === 'ACTIVE')
  const endedRentals = customer.rentals.filter((r) => r.status !== 'ACTIVE')
  const allPayments = customer.rentals.flatMap((r) => r.payments)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

  return (
    <div className="space-y-6">
      {/* Zurück */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Kunden
      </Link>

      {/* Header */}
      <div className="bg-card border rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">
                {customer.firstName} {customer.lastName}
              </h1>
              {customer.customerType && (
                <Badge variant="secondary">{customer.customerType}</Badge>
              )}
              {activeRentals.length > 0 && (
                <Badge variant="default">{activeRentals.length} aktiver Vertrag</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {(customer.street || customer.city) && (
                <div>
                  <p className="text-xs text-muted-foreground">Adresse</p>
                  <p>{customer.street}</p>
                  <p>{customer.postalCode} {customer.city}</p>
                </div>
              )}
              {customer.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.email && (
                <div>
                  <p className="text-xs text-muted-foreground">E-Mail</p>
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.iban && (
                <div>
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="font-mono text-xs">{customer.iban}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Einzugsermächtigung</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {customer.directDebitMandateExists
                    ? <><CheckCircle className="h-4 w-4 text-green-600" /><span>Vorhanden</span>
                        {customer.directDebitMandateDate && (
                          <span className="text-muted-foreground text-xs">
                            · {format(customer.directDebitMandateDate, 'dd.MM.yyyy', { locale: de })}
                          </span>
                        )}
                      </>
                    : <><XCircle className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Nicht vorhanden</span></>
                  }
                </div>
              </div>
            </div>

            {/* Mietanrechnung */}
            {rentCreditAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm">
                <p className="text-green-800 font-medium">
                  Anrechenbare Mieten (letzte 6 Monate): {rentCreditAmount.toFixed(2)} €
                </p>
                <p className="text-green-700 text-xs mt-0.5">
                  Kann bei Kauf eines neuen Instruments angerechnet werden.
                </p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <Link
              href={`/customers/${customer.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors"
            >
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded-t-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Übersicht */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {activeRentals.length === 0 && (
  <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
    <div>
      <p className="font-medium text-sm">Kein aktiver Mietvertrag</p>
      <p className="text-xs text-muted-foreground mt-0.5">Neuen Vertrag für diesen Kunden anlegen</p>
    </div>
    <Link
      href={`/rentals/new?customerId=${customer.id}`}
      className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
    >
      + Mietvertrag anlegen
    </Link>
  </div>
)}
          {activeRentals.length > 0 && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm">Aktive Mietverträge</h3>
              {activeRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between text-sm">
                  <div>
                    <Link href={`/instruments/${rental.instrument.id}`} className="font-medium text-primary hover:underline">
                      {rental.instrument.internalId}
                    </Link>
                    <span className="text-muted-foreground ml-2">
                      {rental.instrument.category?.name} · seit {format(rental.startDate, 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                  <span className="font-medium">{rental.monthlyRent.toFixed(2)} €/Monat</span>
                </div>
              ))}
            </div>
          )}
          {customer.notes && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2">Notizen</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Mietverträge */}
      {activeTab === 'rentals' && (
        <div className="space-y-3">
          {customer.rentals.length === 0 && (
            <p className="text-sm text-muted-foreground">Keine Mietverträge vorhanden.</p>
          )}
          {customer.rentals.map((rental) => (
            <div key={rental.id} className="bg-card border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Link href={`/instruments/${rental.instrument.id}`} className="font-medium text-primary hover:underline">
                  {rental.instrument.internalId} – {rental.instrument.label ?? rental.instrument.category?.name}
                </Link>
                <Badge variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {rental.status === 'ACTIVE' ? 'Aktiv' : 'Beendet'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Von</p>
                  <p>{format(rental.startDate, 'dd.MM.yyyy', { locale: de })}</p>
                </div>
                {rental.endDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Bis</p>
                    <p>{format(rental.endDate, 'dd.MM.yyyy', { locale: de })}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Miete</p>
                  <p>{rental.monthlyRent.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Zahlungsart</p>
                  <p>{PAYMENT_METHOD_LABELS[rental.paymentMethod]}</p>
                </div>
              </div>
              <Link href={`/rentals/${rental.id}`} className="text-xs text-primary hover:underline">
                Vertrag anzeigen →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Zahlungen */}
      {activeTab === 'payments' && (
        <div className="bg-card border rounded-lg overflow-hidden">
          {allPayments.length === 0 ? (
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
                {allPayments.map((payment) => (
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
      )}

      {/* Notizen */}
      {activeTab === 'notes' && (
        <NoteSection customerId={customer.id} notes={customer.notesList} />
      )}
    </div>
  )
}

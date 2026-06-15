'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { getStatusLabel } from '@/lib/status'
import Link from 'next/link'
import { NoteSection } from '@/components/instruments/NoteSection'
import { UploadSection } from '@/components/instruments/UploadSection'
import { RepairSection } from '@/components/instruments/RepairSection'
import { AccessorySection } from '@/components/instruments/AccessorySection'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung',
  CARD: 'Karte',
  UNKNOWN: 'Unbekannt',
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  GENERAL: 'Allgemein',
  CONDITION: 'Zustand',
  RENTAL: 'Vermietung',
  REPAIR: 'Reparatur',
  CUSTOMER: 'Kunde',
  INTERNAL: 'Intern',
}

const TABS = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'rentals', label: 'Vermietung' },
  { id: 'payments', label: 'Zahlungen' },
  { id: 'notes', label: 'Notizen' },
  { id: 'history', label: 'Historie' },
  { id: 'repair', label: 'Reparatur' },
  { id: 'accessories', label: 'Zubehör' },
  { id: 'photos', label: 'Fotos' },
  { id: 'documents', label: 'Dokumente' },
]

interface InstrumentTabsProps {
  instrument: {
    id: string
    internalId: string
    generalNotes: string | null
    rentals: {
      id: string
      startDate: Date
      endDate: Date | null
      monthlyRent: unknown
      depositAmount: unknown
      depositReceivedAt: Date | null
      depositReturnedAt: Date | null
      paymentMethod: string
      paymentReference: string
      status: string
      notes: string | null
      customer: {
        id: string
        firstName: string
        lastName: string
        phone: string | null
        email: string | null
      }
      payments: {
        id: string
        dueDate: Date
        amount: unknown
        method: string
        status: string
        paidAt: Date | null
      }[]
    }[]
    statusHistory: {
      id: string
      oldStatus: string | null
      newStatus: string
      reason: string | null
      changedAt: Date
    }[]
    notes: {
      id: string
      noteType: string
      content: string
      createdAt: Date
    }[]
    photos: { id: string; fileUrl: string; caption: string | null }[]
    documents: { id: string; title: string; fileUrl: string; documentType: string }[]
    accessories: {
      id: string
      name: string
      description: string | null
      serialNumber: string | null
      condition: string | null
      included: boolean
    }[]
    repairEvents: {
      id: string
      title: string
      description: string | null
      repairDate: Date
      costEstimate: unknown
      actualCost: unknown
      status: string
    }[]
  }
  activeRental?: {
    id: string
    startDate: Date
    monthlyRent: unknown
    depositAmount: unknown
    paymentMethod: string
    paymentReference: string
    customer: {
      id: string
      firstName: string
      lastName: string
      phone: string | null
      email: string | null
    }
    payments: {
      id: string
      dueDate: Date
      amount: unknown
      status: string
      paidAt: Date | null
    }[]
  } | null
}

export function InstrumentTabs({ instrument, activeRental }: InstrumentTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const openPayments = activeRental?.payments.filter((p) => p.status === 'OPEN') ?? []
  const allPayments = instrument.rentals.flatMap((r) => r.payments)

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
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
          {activeRental ? (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Aktuelle Vermietung</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Mieter</p>
                  <Link href={`/customers/${activeRental.customer.id}`} className="font-medium text-primary hover:underline">
                    {activeRental.customer.firstName} {activeRental.customer.lastName}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mietbeginn</p>
                  <p className="font-medium">{format(activeRental.startDate, 'dd.MM.yyyy', { locale: de })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monatsmiete</p>
                  <p className="font-medium">{Number(activeRental.monthlyRent).toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Zahlungsart</p>
                  <p className="font-medium">{PAYMENT_METHOD_LABELS[activeRental.paymentMethod]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verwendungszweck</p>
                  <p className="font-mono text-xs font-medium">{activeRental.paymentReference}</p>
                </div>
                {activeRental.customer.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <p className="font-medium">{activeRental.customer.phone}</p>
                  </div>
                )}
              </div>
              {openPayments.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 text-sm text-yellow-800">
                  {openPayments.length} offene Zahlung{openPayments.length !== 1 ? 'en' : ''}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border rounded-lg p-4 text-sm text-muted-foreground">
              Kein aktiver Mietvertrag.
            </div>
          )}

          {instrument.generalNotes && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2 text-sm">Notizen</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{instrument.generalNotes}</p>
            </div>
          )}

          {instrument.statusHistory.length > 0 && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-3 text-sm">Letzte Statusänderungen</h3>
              <div className="space-y-2">
                {instrument.statusHistory.slice(0, 3).map((h) => (
                  <div key={h.id} className="flex items-start gap-2 text-sm">
                    <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                      {format(h.changedAt, 'dd.MM.yy', { locale: de })}
                    </span>
                    <span>→ {getStatusLabel(h.newStatus)}</span>
                    {h.reason && <span className="text-muted-foreground">· {h.reason}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vermietung */}
      {activeTab === 'rentals' && (
        <div className="space-y-3">
          {instrument.rentals.length === 0 && (
            <p className="text-sm text-muted-foreground">Keine Mietverträge vorhanden.</p>
          )}
          {instrument.rentals.map((rental) => (
            <div key={rental.id} className="bg-card border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Link href={`/customers/${rental.customer.id}`} className="font-medium text-primary hover:underline">
                  {rental.customer.firstName} {rental.customer.lastName}
                </Link>
                <Badge variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {rental.status === 'ACTIVE' ? 'Aktiv' : rental.status === 'ENDED' ? 'Beendet' : 'Storniert'}
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
                  <p>{Number(rental.monthlyRent).toFixed(2)} €</p>
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
                    <td className="px-4 py-2">{format(payment.dueDate, 'dd.MM.yyyy', { locale: de })}</td>
                    <td className="px-4 py-2">{Number(payment.amount).toFixed(2)} €</td>
                    <td className="px-4 py-2">{PAYMENT_METHOD_LABELS[payment.method]}</td>
                    <td className="px-4 py-2">
                      <Badge variant={payment.status === 'PAID' ? 'default' : payment.status === 'OPEN' ? 'secondary' : 'destructive'}>
                        {payment.status === 'PAID' ? 'Bezahlt' : payment.status === 'OPEN' ? 'Offen' : 'Überfällig'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {payment.paidAt ? format(payment.paidAt, 'dd.MM.yyyy', { locale: de }) : '–'}
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
        <NoteSection instrumentId={instrument.id} notes={instrument.notes} />
      )}

      {/* Historie */}
      {activeTab === 'history' && (
        <div className="bg-card border rounded-lg overflow-hidden">
          {instrument.statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Keine Statusänderungen vorhanden.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Datum</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Von</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nach</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Grund</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {instrument.statusHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {format(h.changedAt, 'dd.MM.yyyy HH:mm', { locale: de })}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {h.oldStatus ? getStatusLabel(h.oldStatus) : '–'}
                    </td>
                    <td className="px-4 py-2 font-medium">{getStatusLabel(h.newStatus)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{h.reason ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reparatur */}
      {activeTab === 'repair' && (
        <RepairSection
          instrumentId={instrument.id}
          repairEvents={instrument.repairEvents}
          isRented={!!activeRental}
        />
      )}

      {/* Zubehör */}
      {activeTab === 'accessories' && (
        <AccessorySection
          instrumentId={instrument.id}
          accessories={instrument.accessories}
        />
      )}

      {/* Fotos */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          <UploadSection instrumentId={instrument.id} type="photo" />
          {instrument.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {instrument.photos.map((photo) => (
                <a key={photo.id} href={photo.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.fileUrl}
                    alt={photo.caption ?? 'Foto'}
                    className="w-full aspect-square object-cover rounded-lg border hover:opacity-80 transition-opacity"
                  />
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dokumente */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <UploadSection instrumentId={instrument.id} type="document" />
          {instrument.documents.length > 0 && (
            <div className="space-y-2">
              {instrument.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-card border rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{doc.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Öffnen →</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

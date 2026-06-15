import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getStatusLabel, getStatusVariant } from '@/lib/status'
import { Edit, Printer, ArrowLeft } from 'lucide-react'
import { ChangeStatusDialog } from '@/components/instruments/ChangeStatusDialog'

interface InstrumentHeaderProps {
  instrument: {
    id: string
    internalId: string
    label: string | null
    serialNumber: string | null
    model: string | null
    currentValue: unknown
    defaultMonthlyRent: unknown
    defaultDeposit: unknown
    location: string | null
    status: string
    conditionRating: number | null
    category: { name: string } | null
    brand: { name: string } | null
  }
  activeRental?: {
    id: string
    customer: {
      firstName: string
      lastName: string
    }
  } | null
}

export function InstrumentHeader({ instrument, activeRental }: InstrumentHeaderProps) {
  const value = Number(instrument.currentValue)
  const rent = Number(instrument.defaultMonthlyRent)
  const deposit = Number(instrument.defaultDeposit)
  const effectiveStatus = activeRental ? 'RENTED' : instrument.status
  const isRented = !!activeRental

  return (
    <div className="space-y-4">
      <Link
        href="/instruments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Instrumente
      </Link>

      <div className="bg-card border rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-lg font-bold">{instrument.internalId}</span>
              <Badge variant={getStatusVariant(effectiveStatus) as "default" | "secondary" | "destructive" | "outline"}>
                {getStatusLabel(effectiveStatus)}
              </Badge>
              {instrument.conditionRating && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Zustand: {instrument.conditionRating}/5
                </span>
              )}
            </div>

            {instrument.label && (
              <h1 className="text-xl font-semibold">{instrument.label}</h1>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {instrument.category && (
                <div>
                  <p className="text-xs text-muted-foreground">Kategorie</p>
                  <p className="font-medium">{instrument.category.name}</p>
                </div>
              )}
              {instrument.brand && (
                <div>
                  <p className="text-xs text-muted-foreground">Marke / Modell</p>
                  <p className="font-medium">
                    {instrument.brand.name}{instrument.model ? ` ${instrument.model}` : ''}
                  </p>
                </div>
              )}
              {instrument.serialNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Seriennummer</p>
                  <p className="font-mono font-medium">{instrument.serialNumber}</p>
                </div>
              )}
              {instrument.location && (
                <div>
                  <p className="text-xs text-muted-foreground">Standort</p>
                  <p className="font-medium">{instrument.location}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {value > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Zeitwert</p>
                  <p className="font-semibold">{value.toFixed(2)} €</p>
                </div>
              )}
              {rent > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Monatsmiete</p>
                  <p className="font-semibold">{rent.toFixed(2)} €</p>
                </div>
              )}
              {deposit > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Kaution</p>
                  <p className="font-semibold">{deposit.toFixed(2)} €</p>
                </div>
              )}
            </div>

            {activeRental && (
              <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm">
                <span className="text-blue-700 font-medium">
                  Vermietet an: {activeRental.customer.firstName} {activeRental.customer.lastName}
                </span>
              </div>
            )}
          </div>

          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <Link
              href={`/instruments/${instrument.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Bearbeiten</span>
            </Link>
            <ChangeStatusDialog
              instrumentId={instrument.id}
              currentStatus={getStatusLabel(effectiveStatus)}
              isRented={isRented}
              activeRentalId={activeRental?.id}
            />
            <a
              href={`/api/pdf/instrument-card?instrumentId=${instrument.id}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Karteikarte</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

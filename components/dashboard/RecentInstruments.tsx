import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getStatusLabel, getStatusVariant } from '@/lib/status'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Instrument {
  id: string
  internalId: string
  label: string | null
  status: string
  updatedAt: Date
  category: { name: string } | null
  brand: { name: string } | null
  rentals: {
    customer: {
      firstName: string
      lastName: string
    }
  }[]
}

interface RecentInstrumentsProps {
  instruments: Instrument[]
}

export function RecentInstruments({ instruments }: RecentInstrumentsProps) {
  return (
    <div className="bg-card border rounded-lg">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-sm">Zuletzt geänderte Instrumente</h3>
      </div>
      <div className="divide-y">
        {instruments.length === 0 && (
          <p className="text-sm text-muted-foreground px-4 py-6 text-center">
            Keine Instrumente vorhanden
          </p>
        )}
        {instruments.map((instrument) => {
          const activeRental = instrument.rentals[0]
          return (
            <Link
              key={instrument.id}
              href={`/instruments/${instrument.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {instrument.internalId}
                  {instrument.label && (
                    <span className="text-muted-foreground font-normal ml-1">
                      – {instrument.label}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {instrument.brand?.name} {instrument.category?.name}
                  {activeRental && (
                    <span className="ml-2">
                      · {activeRental.customer.firstName} {activeRental.customer.lastName}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <Badge variant={getStatusVariant(instrument.status) as "default" | "secondary" | "destructive" | "outline"}>
                  {getStatusLabel(instrument.status)}
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {formatDistanceToNow(instrument.updatedAt, { addSuffix: true, locale: de })}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="px-4 py-3 border-t">
        <Link href="/instruments" className="text-xs text-primary hover:underline">
          Alle Instrumente anzeigen →
        </Link>
      </div>
    </div>
  )
}

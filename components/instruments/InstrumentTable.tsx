import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getStatusLabel, getStatusVariant } from '@/lib/status'
import { Edit, Eye } from 'lucide-react'

interface Instrument {
  id: string
  internalId: string
  label: string | null
  serialNumber: string | null
  model: string | null
  currentValue: unknown
  status: string
  category: { name: string } | null
  brand: { name: string } | null
  rentals: {
    customer: {
      firstName: string
      lastName: string
    }
  }[]
}

interface InstrumentTableProps {
  instruments: Instrument[]
}

export function InstrumentTable({ instruments }: InstrumentTableProps) {
  if (instruments.length === 0) {
    return (
      <div className="bg-card border rounded-lg px-4 py-12 text-center">
        <p className="text-muted-foreground text-sm">Keine Instrumente gefunden.</p>
        <Link href="/instruments/new" className="text-primary text-sm hover:underline mt-2 inline-block">
          Erstes Instrument anlegen →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bezeichnung</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kategorie</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Marke / Modell</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seriennummer</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Zeitwert</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mieter</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {instruments.map((instrument) => {
              const activeRental = instrument.rentals[0]
              // Effektiver Status: wenn aktiver Vertrag → immer RENTED
              const effectiveStatus = activeRental ? 'RENTED' : instrument.status
              const value = Number(instrument.currentValue)

              return (
                <tr key={instrument.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">
                    {instrument.internalId}
                  </td>
                  <td className="px-4 py-3">
                    {instrument.label ?? <span className="text-muted-foreground">–</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {instrument.category?.name ?? '–'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[instrument.brand?.name, instrument.model].filter(Boolean).join(' ') || '–'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {instrument.serialNumber ?? '–'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(effectiveStatus) as "default" | "secondary" | "destructive" | "outline"}>
                      {getStatusLabel(effectiveStatus)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {value > 0 ? `${value.toFixed(2)} €` : '–'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {activeRental
                      ? `${activeRental.customer.firstName} ${activeRental.customer.lastName}`
                      : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/instruments/${instrument.id}`}
                        className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground"
                        title="Anzeigen"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/instruments/${instrument.id}/edit`}
                        className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground"
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y">
        {instruments.map((instrument) => {
          const activeRental = instrument.rentals[0]
          const effectiveStatus = activeRental ? 'RENTED' : instrument.status
          const value = Number(instrument.currentValue)

          return (
            <Link
              key={instrument.id}
              href={`/instruments/${instrument.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium">{instrument.internalId}</span>
                  <Badge variant={getStatusVariant(effectiveStatus) as "default" | "secondary" | "destructive" | "outline"}>
                    {getStatusLabel(effectiveStatus)}
                  </Badge>
                </div>
                <p className="text-sm mt-0.5 truncate">
                  {instrument.brand?.name} {instrument.model ?? instrument.label ?? ''}
                </p>
                {activeRental && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeRental.customer.firstName} {activeRental.customer.lastName}
                  </p>
                )}
              </div>
              <div className="ml-2 text-right flex-shrink-0">
                {value > 0 && (
                  <p className="text-sm font-medium">{value.toFixed(2)} €</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

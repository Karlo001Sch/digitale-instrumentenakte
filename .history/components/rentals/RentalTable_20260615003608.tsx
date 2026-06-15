import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Eye } from 'lucide-react'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung',
  CARD: 'EC-Karte',
  UNKNOWN: 'Unbekannt',
}

interface Rental {
  id: string
  startDate: Date
  endDate: Date | null
  monthlyRent: number
  paymentMethod: string
  paymentReference: string
  status: string
  customer: {
    id: string
    firstName: string
    lastName: string
  }
  instrument: {
    id: string
    internalId: string
    label: string | null
    category: { name: string } | null
    brand: { name: string } | null
  }
  payments: { id: string }[]
}

export function RentalTable({ rentals }: { rentals: Rental[] }) {
  if (rentals.length === 0) {
    return (
      <div className="bg-card border rounded-lg px-4 py-12 text-center">
        <p className="text-muted-foreground text-sm">Keine Mietverträge gefunden.</p>
        <Link href="/rentals/new" className="text-primary text-sm hover:underline mt-2 inline-block">
          Ersten Mietvertrag anlegen →
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kunde</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instrument</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Von</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bis</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Miete</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Zahlungsart</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Offen</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/customers/${rental.customer.id}`} className="hover:text-primary transition-colors">
                    {rental.customer.lastName}, {rental.customer.firstName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/instruments/${rental.instrument.id}`} className="hover:text-primary transition-colors">
                    <span className="font-mono text-xs">{rental.instrument.internalId}</span>
                    {rental.instrument.category && (
                      <span className="text-muted-foreground ml-1">· {rental.instrument.category.name}</span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(rental.startDate, 'dd.MM.yyyy', { locale: de })}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {rental.endDate ? format(rental.endDate, 'dd.MM.yyyy', { locale: de }) : '–'}
                </td>
                <td className="px-4 py-3 text-right">
                  {Number(rental.monthlyRent ?? 0).toFixed(2)} €
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {PAYMENT_METHOD_LABELS[rental.paymentMethod]}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {rental.status === 'ACTIVE' ? 'Aktiv' : rental.status === 'ENDED' ? 'Beendet' : 'Storniert'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {rental.payments.length > 0 && (
                    <Badge variant="warning">
                      {rental.payments.length} offen
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/rentals/${rental.id}`}
                    className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground inline-flex"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y">
        {rentals.map((rental) => (
          <Link
            key={rental.id}
            href={`/rentals/${rental.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {rental.customer.lastName}, {rental.customer.firstName}
                </p>
                <Badge variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {rental.status === 'ACTIVE' ? 'Aktiv' : 'Beendet'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rental.instrument.internalId} · ab {format(rental.startDate, 'dd.MM.yy', { locale: de })}
              </p>
            </div>
            <div className="ml-2 text-right flex-shrink-0">
              <p className="text-sm font-medium">{Number(rental.monthlyRent ?? 0).toFixed(2)} €</p>
              {rental.payments.length > 0 && (
                <p className="text-xs text-yellow-600">{rental.payments.length} offen</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

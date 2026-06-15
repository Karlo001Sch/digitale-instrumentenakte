import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Payment {
  id: string
  dueDate: Date
  amount: unknown
  method: string
  paymentReference: string | null
  customer: {
    firstName: string
    lastName: string
  }
  instrument: {
    internalId: string
    label: string | null
  }
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung',
  CARD: 'Karte',
  UNKNOWN: 'Unbekannt',
}

interface OpenPaymentsListProps {
  payments: Payment[]
}

export function OpenPaymentsList({ payments }: OpenPaymentsListProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-card border rounded-lg">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-sm">Offene Zahlungen</h3>
      </div>
      <div className="divide-y">
        {payments.length === 0 && (
          <p className="text-sm text-muted-foreground px-4 py-6 text-center">
            Keine offenen Zahlungen
          </p>
        )}
        {payments.map((payment) => {
          const isOverdue = new Date(payment.dueDate) < today
          const amount = typeof payment.amount === 'object' && payment.amount !== null
            ? Number(payment.amount)
            : Number(payment.amount)

          return (
            <div
              key={payment.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {payment.customer.firstName} {payment.customer.lastName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {payment.instrument.internalId} · {METHOD_LABELS[payment.method]}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium">{amount.toFixed(2)} €</p>
                  <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    {isOverdue ? 'Überfällig · ' : ''}
                    {format(new Date(payment.dueDate), 'dd.MM.yy', { locale: de })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-3 border-t">
        <Link href="/payments" className="text-xs text-primary hover:underline">
          Alle Zahlungen anzeigen →
        </Link>
      </div>
    </div>
  )
}

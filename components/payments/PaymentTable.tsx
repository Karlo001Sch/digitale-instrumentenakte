'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { markPaymentAsPaid } from '@/components/payments/paymentActions'
import { CheckCircle } from 'lucide-react'
import { PaymentActions } from '@/components/payments/PaymentActionsWidget'



const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung',
  CARD: 'EC-Karte',
  UNKNOWN: 'Unbekannt',
}

interface Payment {
  id: string
  dueDate: Date
  amount: number
  method: string
  status: string
  paidAt: Date | null
  paymentReference: string | null
  notes: string | null
  customer: { id: string; firstName: string; lastName: string }
  instrument: { id: string; internalId: string; label: string | null }
  rentalContract: { id: string }
}

interface PaymentTableProps {
  payments: Payment[]
  showMarkAsPaid: boolean
  emptyMessage: string
}

export function PaymentTable({ payments, showMarkAsPaid, emptyMessage }: PaymentTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [markedPaid, setMarkedPaid] = useState<Set<string>>(new Set())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  async function handleMarkAsPaid(paymentId: string) {
    setLoadingId(paymentId)
    const result = await markPaymentAsPaid(paymentId)
    if (result?.success) {
      setMarkedPaid((prev) => new Set(prev).add(paymentId))
    }
    setLoadingId(null)
  }

  const visiblePayments = payments.filter((p) => !markedPaid.has(p.id))

  if (visiblePayments.length === 0) {
    return (
      <div className="bg-card border rounded-lg px-4 py-12 text-center">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fälligkeit</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kunde</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instrument</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Betrag</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Zahlungsart</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Verwendungszweck</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              {showMarkAsPaid && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visiblePayments.map((payment) => {
              const isOverdue = new Date(payment.dueDate) < today && payment.status === 'OPEN'
              const isLoading = loadingId === payment.id

              return (
                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                  <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    {format(new Date(payment.dueDate), 'dd.MM.yyyy', { locale: de })}
                    {isOverdue && <span className="ml-1 text-xs">(überfällig)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/customers/${payment.customer.id}`} className="hover:text-primary transition-colors">
                      {payment.customer.lastName}, {payment.customer.firstName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/instruments/${payment.instrument.id}`} className="font-mono text-xs hover:text-primary transition-colors">
                      {payment.instrument.internalId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {payment.amount.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {payment.paymentReference ?? '–'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={payment.status === 'PAID' ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                      {payment.status === 'PAID' ? 'Bezahlt' : isOverdue ? 'Überfällig' : 'Offen'}
                    </Badge>
                  </td>
                      {showMarkAsPaid && (
                        <td className="px-4 py-3">
                          <PaymentActions
                            payment={{
                              ...payment,
                              dunningRecords: [],
                            }}
                            orgName="Musikwerkstatt Muster"
                          />
                        </td>
                      )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y">
        {visiblePayments.map((payment) => {
          const isOverdue = new Date(payment.dueDate) < today && payment.status === 'OPEN'
          const isLoading = loadingId === payment.id

          return (
            <div key={payment.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <Link href={`/customers/${payment.customer.id}`} className="font-medium text-sm hover:text-primary">
                  {payment.customer.lastName}, {payment.customer.firstName}
                </Link>
                <span className="font-medium text-sm">{payment.amount.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {payment.instrument.internalId} · {PAYMENT_METHOD_LABELS[payment.method]}
                </span>
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {format(new Date(payment.dueDate), 'dd.MM.yy', { locale: de })}
                  {isOverdue && ' (überfällig)'}
                </span>
              </div>
              {showMarkAsPaid && (
                <button
                  onClick={() => handleMarkAsPaid(payment.id)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Als bezahlt markieren
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

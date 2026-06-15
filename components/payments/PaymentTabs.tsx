'use client'

import { useState } from 'react'
import { PaymentTable } from '@/components/payments/PaymentTable'

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

interface PaymentTabsProps {
  openPayments: Payment[]
  overduePayments: Payment[]
  cashPayments: Payment[]
  paidPayments: Payment[]
}

const TABS = [
  { id: 'open', label: 'Offen' },
  { id: 'overdue', label: 'Überfällig' },
  { id: 'cash', label: 'Barzahlungen' },
  { id: 'paid', label: 'Bezahlt' },
]

export function PaymentTabs({
  openPayments,
  overduePayments,
  cashPayments,
  paidPayments,
}: PaymentTabsProps) {
  const [activeTab, setActiveTab] = useState('open')

  const counts: Record<string, number> = {
    open: openPayments.length,
    overdue: overduePayments.length,
    cash: cashPayments.length,
    paid: paidPayments.length,
  }

  const payments: Record<string, Payment[]> = {
    open: openPayments,
    overdue: overduePayments,
    cash: cashPayments,
    paid: paidPayments,
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b overflow-x-auto pb-1">
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
            {counts[tab.id] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <PaymentTable
        payments={payments[activeTab]}
        showMarkAsPaid={activeTab !== 'paid'}
        emptyMessage={
          activeTab === 'open' ? 'Keine offenen Zahlungen.' :
          activeTab === 'overdue' ? 'Keine überfälligen Zahlungen.' :
          activeTab === 'cash' ? 'Keine offenen Barzahlungen.' :
          'Noch keine bezahlten Zahlungen.'
        }
      />
    </div>
  )
}

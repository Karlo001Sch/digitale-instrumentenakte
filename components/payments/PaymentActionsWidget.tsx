'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, FileText, CheckCircle } from 'lucide-react'
import { markPaymentAsPaid } from '@/components/payments/paymentActions'
import { recordDunning } from '@/components/payments/dunningActions'

interface PaymentActionsProps {
  payment: {
    id: string
    amount: number
    method: string
    dueDate: Date
    paymentReference: string | null
    dunningRecords?: { level: number }[]
    customer: {
      id: string
      firstName: string
      lastName: string
      email: string | null
      street: string | null
      postalCode: string | null
      city: string | null
    }
    instrument: {
      id: string
      internalId: string
      label: string | null
    }
    rentalContract: {
      id: string
    }
  }
  orgName: string
  senderEmail?: string
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Bar', BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Abbuchung', CARD: 'EC-Karte', UNKNOWN: 'Unbekannt',
}

export function PaymentActions({ payment, orgName, senderEmail = 'mail@klarinettenmueller.de' }: PaymentActionsProps) {
  const [loadingPaid, setLoadingPaid] = useState(false)
  const [marked, setMarked] = useState(false)
  const router = useRouter()

  const dunningLevel = payment.dunningRecords?.length ?? 0
  const nextLevel = dunningLevel + 1
  const hasFee = nextLevel >= 2
  const fee = hasFee ? 5.00 : 0

  const fmt = (d: Date) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // mailto Link für Zahlungserinnerung
  function buildMailtoLink() {
    const subject = encodeURIComponent(
      `Zahlungserinnerung – ${payment.paymentReference ?? payment.instrument.internalId}`
    )
    const body = encodeURIComponent(
      `Sehr geehrte/r ${payment.customer.firstName} ${payment.customer.lastName},\n\n` +
      `wir möchten Sie freundlich daran erinnern, dass folgende Zahlung noch aussteht:\n\n` +
      `Instrument: ${payment.instrument.internalId}${payment.instrument.label ? ` – ${payment.instrument.label}` : ''}\n` +
      `Betrag: ${payment.amount.toFixed(2)} €\n` +
      `Fällig am: ${fmt(payment.dueDate)}\n` +
      `Verwendungszweck: ${payment.paymentReference ?? ''}\n` +
      `Zahlungsart: ${PAYMENT_METHOD_LABELS[payment.method]}\n\n` +
      `Bitte überweisen Sie den ausstehenden Betrag so bald wie möglich.\n\n` +
      `Bei Fragen stehen wir Ihnen gerne zur Verfügung.\n\n` +
      `Mit freundlichen Grüßen\n${orgName}`
    )
    const to = payment.customer.email ?? ''
    return `mailto:${to}?subject=${subject}&body=${body}`
  }

  async function handleMarkPaid() {
    setLoadingPaid(true)
    const result = await markPaymentAsPaid(payment.id)
    if (result?.success) setMarked(true)
    setLoadingPaid(false)
    router.refresh()
  }

  async function handleDunning(level: number) {
    await recordDunning({
      paymentId: payment.id,
      customerId: payment.customer.id,
      level,
      fee: level >= 2 ? 5 : 0,
    })
    router.refresh()
  }

  if (marked) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-xs">
        <CheckCircle className="h-4 w-4" />
        Bezahlt
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Als bezahlt markieren */}
      <button
        onClick={handleMarkPaid}
        disabled={loadingPaid}
        className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 disabled:opacity-50 transition-colors"
        title="Als bezahlt markieren"
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden lg:inline">Bezahlt</span>
      </button>

      {/* Zahlungserinnerung */}
      <a
        href={buildMailtoLink()}
        onClick={() => handleDunning(0)}
        className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 transition-colors"
        title="Zahlungserinnerung per Mail öffnen"
      >
        <Mail className="h-4 w-4" />
        <span className="hidden lg:inline">Erinnerung</span>
      </a>

      {/* Mahnung PDF */}
      <a
        href={`/api/pdf/dunning?paymentId=${payment.id}&level=${nextLevel}`}
        target="_blank"
        onClick={() => handleDunning(nextLevel)}
        className="flex items-center gap-1 text-xs text-orange-700 hover:text-orange-800 transition-colors"
        title={`${nextLevel}. Mahnung${hasFee ? ' (+5€)' : ''} drucken`}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden lg:inline">
          {nextLevel}. Mahnung{hasFee ? ' +5€' : ''}
        </span>
      </a>
    </div>
  )
}

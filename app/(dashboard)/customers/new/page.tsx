import { CustomerForm } from '@/components/customers/CustomerForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 block"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Kunden
        </Link>
        <h1 className="text-2xl font-bold">Neuer Kunde</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kundendaten erfassen.
        </p>
      </div>
      <CustomerForm />
    </div>
  )
}

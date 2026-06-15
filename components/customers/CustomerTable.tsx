import Link from 'next/link'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  street: string | null
  postalCode: string | null
  city: string | null
  phone: string | null
  email: string | null
  customerType: string | null
  directDebitMandateExists: boolean
  rentals: { id: string }[]
}

export function CustomerTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return (
      <div className="bg-card border rounded-lg px-4 py-12 text-center">
        <p className="text-muted-foreground text-sm">Keine Kunden gefunden.</p>
        <Link href="/customers/new" className="text-primary text-sm hover:underline mt-2 inline-block">
          Ersten Kunden anlegen →
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Adresse</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Telefon</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-Mail</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Einzug</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Verträge</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {customer.lastName}, {customer.firstName}
                  {customer.customerType && (
                    <span className="ml-2 text-xs text-muted-foreground">({customer.customerType})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[customer.street, customer.postalCode, customer.city].filter(Boolean).join(', ') || '–'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{customer.phone ?? '–'}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.email ?? '–'}</td>
                <td className="px-4 py-3">
                  {customer.directDebitMandateExists
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {customer.rentals.length > 0
                    ? <span className="text-primary font-medium">{customer.rentals.length} aktiv</span>
                    : '–'}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${customer.id}`}
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
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium">{customer.lastName}, {customer.firstName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customer.phone ?? customer.email ?? '–'}
              </p>
            </div>
            <div className="text-right">
              {customer.rentals.length > 0 && (
                <span className="text-xs text-primary font-medium">{customer.rentals.length} aktiv</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

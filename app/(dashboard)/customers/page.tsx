import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { CustomerTable } from '@/components/customers/CustomerTable'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface PageProps {
  searchParams: { search?: string }
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const { search } = searchParams

  const customers = await prisma.customer.findMany({
    where: {
      organizationId: orgId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      customerType: true,
      street: true,
      postalCode: true,
      city: true,
      directDebitMandateExists: true,
      rentals: {
        where: { status: 'ACTIVE' },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { lastName: 'asc' },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kunden</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {customers.length} Kunde{customers.length !== 1 ? 'n' : ''}
          </p>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Neuer Kunde
        </Link>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form>
          <input
            name="search"
            type="text"
            placeholder="Suche nach Name, E-Mail, Telefon..."
            defaultValue={search}
            className="pl-9 flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
      </div>

      <CustomerTable customers={customers} />
    </div>
  )
}

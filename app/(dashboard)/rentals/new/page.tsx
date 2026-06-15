import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { NewRentalForm } from '@/components/rentals/NewRentalForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: { customerId?: string }
}

export default async function NewRentalPage({ searchParams }: PageProps) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const availableInstruments = await prisma.instrument.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      rentals: { none: { status: 'ACTIVE' } },
    },
    include: { category: true, brand: true },
    orderBy: { internalId: 'asc' },
  })

  const customers = await prisma.customer.findMany({
    where: { organizationId: orgId },
    orderBy: { lastName: 'asc' },
  })

  const preselectedCustomerId = searchParams.customerId ?? ''
  const preselectedCustomer = customers.find((c) => c.id === preselectedCustomerId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={preselectedCustomer ? `/customers/${preselectedCustomerId}` : '/rentals'}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 block"
        >
          <ArrowLeft className="h-4 w-4" />
          {preselectedCustomer
            ? `Zurück zu ${preselectedCustomer.firstName} ${preselectedCustomer.lastName}`
            : 'Alle Mietverträge'}
        </Link>
        <h1 className="text-2xl font-bold">Neuer Mietvertrag</h1>
        {preselectedCustomer && (
          <p className="text-sm text-muted-foreground mt-1">
            Kunde: <strong>{preselectedCustomer.firstName} {preselectedCustomer.lastName}</strong>
          </p>
        )}
      </div>
      <NewRentalForm
        instruments={availableInstruments}
        customers={customers}
        preselectedCustomerId={preselectedCustomerId}
      />
    </div>
  )
}

import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { RentalTable } from '@/components/rentals/RentalTable'
import { RentalFilters } from '@/components/rentals/RentalFilters'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface PageProps {
  searchParams: {
    status?: string
    paymentMethod?: string
  }
}

export default async function RentalsPage({ searchParams }: PageProps) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const { status, paymentMethod } = searchParams

  const rentals = await prisma.rentalContract.findMany({
    where: {
      organizationId: orgId,
      ...(status && { status: status as never }),
      ...(paymentMethod && { paymentMethod: paymentMethod as never }),
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      monthlyRent: true,
      status: true,
      paymentMethod: true,
      customer: { select: { id: true, firstName: true, lastName: true } },
      instrument: {
        select: {
          id: true,
          internalId: true,
          label: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      },
      payments: {
        where: { status: 'OPEN' },
        select: { id: true },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mietverträge</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rentals.length} Vertrag{rentals.length !== 1 ? 'e' : ''}
          </p>
        </div>
        <Link
          href="/rentals/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Neuer Vertrag
        </Link>
      </div>

      <RentalFilters
        currentStatus={status}
        currentPaymentMethod={paymentMethod}
      />

      <RentalTable rentals={rentals} />
    </div>
  )
}

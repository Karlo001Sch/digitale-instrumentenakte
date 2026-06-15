import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { RentalDetail } from '@/components/rentals/RentalDetail'

export default async function RentalDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const rental = await prisma.rentalContract.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      customer: true,
      instrument: {
        include: { category: true, brand: true },
      },
      payments: {
        orderBy: { dueDate: 'asc' },
      },
    },
  })

  if (!rental) notFound()

  const serialized = {
    ...rental,
    monthlyRent: Number(rental.monthlyRent),
    depositAmount: Number(rental.depositAmount),
    payments: rental.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  }

  return <RentalDetail rental={serialized} />
}

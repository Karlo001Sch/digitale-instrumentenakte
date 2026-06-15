import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InstrumentHeader } from '@/components/instruments/InstrumentHeader'
import { InstrumentTabs } from '@/components/instruments/InstrumentTabs'


export default async function InstrumentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const instrument = await prisma.instrument.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      category: true,
      brand: true,
      rentals: {
        include: {
          customer: true,
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 10,
          },
        },
        orderBy: { startDate: 'desc' },
      },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      photos: {
        orderBy: { uploadedAt: 'desc' },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
      accessories: {
        orderBy: { createdAt: 'asc' },
      },
      repairEvents: {
        orderBy: { repairDate: 'desc' },
      },
    },
  })

  if (!instrument) notFound()

  const activeRental = instrument.rentals.find((r) => r.status === 'ACTIVE')

  return (
    <div className="space-y-6">
      <InstrumentHeader instrument={instrument} activeRental={activeRental} />
      <InstrumentTabs instrument={instrument} activeRental={activeRental} />
    </div>
  )
}

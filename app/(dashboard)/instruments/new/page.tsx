import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { InstrumentForm } from '@/components/instruments/InstrumentForm'

export default async function NewInstrumentPage() {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const [categories, brands] = await Promise.all([
    prisma.instrumentCategory.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    }),
    prisma.instrumentBrand.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Neues Instrument</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Instrument anlegen und zur Instrumentenakte hinzufügen.
        </p>
      </div>
      <InstrumentForm categories={categories} brands={brands} />
    </div>
  )
}

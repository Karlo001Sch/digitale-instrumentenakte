import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InstrumentForm } from '@/components/instruments/InstrumentForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditInstrumentPage({
  params,
}: {
  params: { id: string }
}) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const [instrument, categories, brands] = await Promise.all([
    prisma.instrument.findFirst({
      where: { id: params.id, organizationId: orgId },
    }),
    prisma.instrumentCategory.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    }),
    prisma.instrumentBrand.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!instrument) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/instruments/${instrument.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 block"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Instrumentenakte
        </Link>
        <h1 className="text-2xl font-bold">Instrument bearbeiten</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {instrument.internalId}{instrument.label ? ` – ${instrument.label}` : ''}
        </p>
      </div>
      <InstrumentForm
        categories={categories}
        brands={brands}
        defaultValues={instrument}
      />
    </div>
  )
}

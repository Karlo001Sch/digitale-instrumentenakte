import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { ReturnForm } from '@/components/rentals/ReturnForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ReturnPage({
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
      instrument: true,
    },
  })

  if (!rental) notFound()
  if (rental.status !== 'ACTIVE') redirect(`/rentals/${params.id}`)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/rentals/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 block"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Vertrag
        </Link>
        <h1 className="text-2xl font-bold">Rückgabe erfassen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rental.customer.firstName} {rental.customer.lastName} · {rental.instrument.internalId}
        </p>
      </div>
      <ReturnForm
        rentalId={rental.id}
        depositAmount={Number(rental.depositAmount)}
        instrumentId={rental.instrument.id}
      />
    </div>
  )
}

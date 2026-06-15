import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CustomerForm } from '@/components/customers/CustomerForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, organizationId: orgId },
  })

  if (!customer) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/customers/${customer.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 block"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Kunden
        </Link>
        <h1 className="text-2xl font-bold">Kunde bearbeiten</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {customer.firstName} {customer.lastName}
        </p>
      </div>
      <CustomerForm defaultValues={customer} />
    </div>
  )
}

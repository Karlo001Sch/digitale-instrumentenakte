import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CustomerDetail } from '@/components/customers/CustomerDetail'

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      rentals: {
        include: {
          instrument: {
            include: { category: true, brand: true },
          },
          payments: {
            orderBy: { dueDate: 'desc' },
          },
        },
        orderBy: { startDate: 'desc' },
      },
      notesList: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!customer) notFound()

  // Anrechenbare Mieten berechnen (letzte 6 Monate)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const rentCredit = await prisma.payment.aggregate({
    where: {
      customerId: customer.id,
      status: 'PAID',
      paidAt: { gte: sixMonthsAgo },
    },
    _sum: { amount: true },
  })

  const rentCreditAmount = Number(rentCredit._sum.amount ?? 0)

  // Serialisieren für Client Components
  const serializedCustomer = {
    ...customer,
    rentals: customer.rentals.map((r) => ({
      ...r,
      monthlyRent: Number(r.monthlyRent),
      depositAmount: Number(r.depositAmount),
      payments: r.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    })),
  }

  return (
    <CustomerDetail
      customer={serializedCustomer}
      rentCreditAmount={rentCreditAmount}
    />
  )
}

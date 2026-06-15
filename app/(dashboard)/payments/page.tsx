import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PaymentTabs } from '@/components/payments/PaymentTabs'

export default async function PaymentsPage() {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Load all payments in ONE query instead of 4 redundant queries
  const allPayments = await prisma.payment.findMany({
    where: { organizationId: orgId },
    include: { customer: true, instrument: true, rentalContract: true },
    orderBy: { dueDate: 'asc' },
  })

  // Client-side filtering (now all data is in memory)
  const openPayments = allPayments.filter((p) => p.status === 'OPEN')
  const overduePayments = openPayments.filter((p) => p.dueDate && p.dueDate < today)
  const cashPayments = openPayments.filter((p) => p.method === 'CASH')
  const paidPayments = allPayments
    .filter((p) => p.status === 'PAID')
    .sort((a, b) => (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0))
    .slice(0, 50)

  const serialize = (payments: typeof allPayments) =>
    payments.map((p) => ({ ...p, amount: Number(p.amount) }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Zahlungen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {openPayments.length} offen · {overduePayments.length} überfällig · {cashPayments.length} Bar offen
        </p>
      </div>
      <PaymentTabs
        openPayments={serialize(openPayments)}
        overduePayments={serialize(overduePayments)}
        cashPayments={serialize(cashPayments)}
        paidPayments={serialize(paidPayments)}
      />
    </div>
  )
}

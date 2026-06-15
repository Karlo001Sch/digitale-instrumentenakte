import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentInstruments } from '@/components/dashboard/RecentInstruments'
import { OpenPaymentsList } from '@/components/dashboard/OpenPaymentsList'

export default async function DashboardPage() {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Instrument-Kennzahlen
  const [
    totalInstruments,
    available,
    rented,
    inRepair,
    overhaulExternal,
    awayOrMissing,
  ] = await Promise.all([
    prisma.instrument.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.instrument.count({ where: { organizationId: orgId, isActive: true, status: 'AVAILABLE' } }),
    prisma.instrument.count({ where: { organizationId: orgId, isActive: true, status: 'RENTED' } }),
    prisma.instrument.count({ where: { organizationId: orgId, isActive: true, status: 'IN_REPAIR' } }),
    prisma.instrument.count({ where: { organizationId: orgId, isActive: true, status: 'OVERHAUL_EXTERNAL' } }),
    prisma.instrument.count({ where: { organizationId: orgId, isActive: true, status: 'AWAY_OR_MISSING' } }),
  ])

  // Zahlungs-Kennzahlen
  const [openPayments, overduePayments, openCashPayments] = await Promise.all([
    prisma.payment.count({
      where: { organizationId: orgId, status: 'OPEN' },
    }),
    prisma.payment.count({
      where: { organizationId: orgId, status: 'OPEN', dueDate: { lt: today } },
    }),
    prisma.payment.count({
      where: { organizationId: orgId, status: 'OPEN', method: 'CASH' },
    }),
  ])

  // Zuletzt geänderte Instrumente
  const recentInstruments = await prisma.instrument.findMany({
    where: { organizationId: orgId, isActive: true },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      category: true,
      brand: true,
      rentals: {
        where: { status: 'ACTIVE' },
        include: { customer: true },
        take: 1,
      },
    },
  })

  // Offene Zahlungen (Liste)
  const openPaymentsList = await prisma.payment.findMany({
    where: { organizationId: orgId, status: 'OPEN' },
    orderBy: { dueDate: 'asc' },
    take: 5,
    include: {
      customer: true,
      instrument: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <DashboardStats
        totalInstruments={totalInstruments}
        available={available}
        rented={rented}
        inRepair={inRepair}
        overhaulExternal={overhaulExternal}
        awayOrMissing={awayOrMissing}
        openPayments={openPayments}
        overduePayments={overduePayments}
        openCashPayments={openCashPayments}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInstruments instruments={recentInstruments} />
        <OpenPaymentsList payments={openPaymentsList} />
      </div>
    </div>
  )
}

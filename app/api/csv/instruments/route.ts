import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Vermietfähig', RENTED: 'Vermietet', IN_REPAIR: 'In Reparatur',
  AWAY_OR_MISSING: 'Nicht vorhanden / unterwegs', OVERHAUL_EXTERNAL: 'Zur Generalüberholung mitgegeben',
  RESERVED: 'Reserviert', SOLD: 'Verkauft', RETIRED: 'Ausgemustert',
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  })
  if (!membership) return NextResponse.json({ error: 'Keine Organisation' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const categoryId = searchParams.get('categoryId')
  const brandId = searchParams.get('brandId')
  const search = searchParams.get('search')

  const instruments = await prisma.instrument.findMany({
    where: {
      organizationId: membership.organizationId,
      isActive: true,
      ...(status && { status: status as never }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(search && {
        OR: [
          { internalId: { contains: search, mode: 'insensitive' } },
          { label: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      category: true,
      brand: true,
      rentals: {
        where: { status: 'ACTIVE' },
        include: { customer: true },
        take: 1,
      },
    },
    orderBy: { internalId: 'asc' },
  })

  const headers = [
    'internalId', 'label', 'category', 'brand', 'model',
    'serialNumber', 'status', 'currentValue', 'defaultMonthlyRent',
    'defaultDeposit', 'currentRenterName', 'location', 'generalNotes',
  ]

  const escape = (val: unknown) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = instruments.map((i) => {
    const activeRental = i.rentals[0]
    const renterName = activeRental
      ? `${activeRental.customer.firstName} ${activeRental.customer.lastName}`
      : ''
    return [
      escape(i.internalId),
      escape(i.label),
      escape(i.category?.name),
      escape(i.brand?.name),
      escape(i.model),
      escape(i.serialNumber),
      escape(STATUS_LABELS[i.status] ?? i.status),
      escape(i.currentValue ? Number(i.currentValue).toFixed(2) : ''),
      escape(i.defaultMonthlyRent ? Number(i.defaultMonthlyRent).toFixed(2) : ''),
      escape(i.defaultDeposit ? Number(i.defaultDeposit).toFixed(2) : ''),
      escape(renterName),
      escape(i.location),
      escape(i.generalNotes),
    ].join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const bom = '\uFEFF'

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="Instrumente-${new Date().toLocaleDateString('de-DE').replace(/\./g, '-')}.csv"`,
    },
  })
}

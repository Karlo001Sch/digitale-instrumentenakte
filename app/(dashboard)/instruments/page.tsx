import { requireOrganization } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { InstrumentTable } from '@/components/instruments/InstrumentTable'
import { InstrumentFilters } from '@/components/instruments/InstrumentFilters'
import Link from 'next/link'
import { CsvExportButton } from '@/components/instruments/CsvExportButton'
import { CsvImportButton } from '@/components/instruments/CsvImportButton'
import { Plus } from 'lucide-react'

interface PageProps {
  searchParams: {
    search?: string
    status?: string
    categoryId?: string
    brandId?: string
  }
}

export default async function InstrumentsPage({ searchParams }: PageProps) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const { search, status, categoryId, brandId } = searchParams

  const instruments = await prisma.instrument.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      ...(status && { status: status as never }),
      ...(status === 'AVAILABLE' ? { rentals: { none: { status: 'ACTIVE' } } } : {}),
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
    select: {
      id: true,
      internalId: true,
      label: true,
      model: true,
      serialNumber: true,
      currentValue: true,
      status: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      rentals: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          startDate: true,
          customer: { select: { firstName: true, lastName: true } },
        },
        take: 1,
      },
    },
    orderBy: { internalId: 'asc' },
  })

  const categories = await prisma.instrumentCategory.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  })

  const brands = await prisma.instrumentBrand.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instrumente</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {instruments.length} Instrument{instruments.length !== 1 ? 'e' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <CsvImportButton />
          <CsvExportButton search={search} status={status} categoryId={categoryId} brandId={brandId} />
          <Link
            href="/instruments/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neues Instrument
          </Link>
        </div>
      </div>

      <InstrumentFilters
        categories={categories}
        brands={brands}
        currentSearch={search}
        currentStatus={status}
        currentCategoryId={categoryId}
        currentBrandId={brandId}
      />

      <InstrumentTable instruments={instruments} />
    </div>
  )
}

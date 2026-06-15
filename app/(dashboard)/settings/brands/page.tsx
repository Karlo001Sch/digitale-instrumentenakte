import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { BrandsManager } from '@/components/settings/BrandsManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function BrandsPage() {
  const membership = await requireRole(['ADMIN', 'STAFF'])
  const orgId = membership.organizationId

  const brands = await prisma.instrumentBrand.findMany({
    where: { organizationId: orgId },
    include: { _count: { select: { instruments: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 block">
          <ArrowLeft className="h-4 w-4" />Einstellungen
        </Link>
        <h1 className="text-2xl font-bold">Marken</h1>
        <p className="text-sm text-muted-foreground mt-1">Instrumentenmarken verwalten</p>
      </div>
      <BrandsManager brands={brands} />
    </div>
  )
}

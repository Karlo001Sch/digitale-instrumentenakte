import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { DesignSettings } from '@/components/settings/DesignSettings'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function DesignPage() {
  const membership = await requireRole(['ADMIN'])
  const orgId = membership.organizationId

  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  })

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 block">
          <ArrowLeft className="h-4 w-4" />Einstellungen
        </Link>
        <h1 className="text-2xl font-bold">Design & Erscheinungsbild</h1>
        <p className="text-sm text-muted-foreground mt-1">Logo, Farben und Programmname anpassen</p>
      </div>
      <DesignSettings
        organizationId={orgId}
        orgName={org?.name ?? ''}
        settings={settings}
      />
    </div>
  )
}

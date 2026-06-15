import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { UsersManager } from '@/components/settings/UsersManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function UsersPage() {
  const membership = await requireRole(['ADMIN'])
  const orgId = membership.organizationId

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 block">
          <ArrowLeft className="h-4 w-4" />Einstellungen
        </Link>
        <h1 className="text-2xl font-bold">Nutzerverwaltung</h1>
        <p className="text-sm text-muted-foreground mt-1">Mitglieder dieser Organisation</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 text-sm text-yellow-800">
        Neue Nutzer müssen zuerst im <strong>Supabase Dashboard → Authentication → Users</strong> angelegt werden.
        Danach können sie sich einloggen und werden automatisch dieser Organisation zugewiesen wenn sie
        <strong> /setup</strong> aufrufen.
      </div>

      <UsersManager members={members} currentUserId={membership.userId} />
    </div>
  )
}

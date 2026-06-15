import { requireAuth, ensureUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SetupPage() {
  const user = await requireAuth()

  // Prüfen ob bereits Mitglied
  const existing = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  })

  if (existing) {
    redirect('/dashboard')
  }

  // Erste Organisation holen
  const org = await prisma.organization.findFirst()

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="bg-card border rounded-lg p-8 w-full max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">Keine Organisation</h1>
          <p className="text-sm text-muted-foreground">
            Bitte zuerst den Seed ausführen: <code>npm run db:seed</code>
          </p>
        </div>
      </div>
    )
  }

  // UserProfile anlegen und Mitgliedschaft erstellen
  await ensureUserProfile(user.id, user.email ?? '')

  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'ADMIN',
    },
  })

  redirect('/dashboard')
}

import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// React cache() memoized den Aufruf pro Request
// d.h. egal wie oft getOrgSettings() aufgerufen wird, DB wird nur einmal abgefragt
export const getOrgSettings = cache(async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return { settings: null, orgName: '', orgId: '' }
    
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      select: {
        organizationId: true,
        organization: { select: { id: true, name: true, settings: true } },
      },
    })
    
    if (!membership?.organization) return { settings: null, orgName: '', orgId: '' }
    return {
      settings: membership.organization.settings ?? null,
      orgName: membership.organization.name ?? '',
      orgId: membership.organization.id ?? '',
    }
  } catch {
    return { settings: null, orgName: '', orgId: '' }
  }
})

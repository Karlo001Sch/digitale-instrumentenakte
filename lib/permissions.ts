import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export type UserRole = 'ADMIN' | 'STAFF' | 'VIEWER'

export async function getCurrentOrganization() {
  const user = await getCurrentUser()
  if (!user) return null

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    select: {
      organization: { select: { id: true, name: true, type: true, createdAt: true, updatedAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return member?.organization ?? null
}

export async function getCurrentMembership() {
  const user = await getCurrentUser()
  if (!user) return null

  return prisma.organizationMember.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      role: true,
      createdAt: true,
      organization: { select: { id: true, name: true, type: true } },
      user: { select: { id: true, email: true, fullName: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function requireOrganization() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      role: true,
      createdAt: true,
      organization: { select: { id: true, name: true, type: true } },
      user: { select: { id: true, email: true, fullName: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (!membership) {
    redirect('/no-organization')
  }

  return membership
}

export async function requireRole(roles: UserRole[]) {
  const membership = await requireOrganization()

  if (!roles.includes(membership.role as UserRole)) {
    redirect('/dashboard')
  }

  return membership
}

export async function hasRole(roles: UserRole[]): Promise<boolean> {
  const membership = await getCurrentMembership()
  if (!membership) return false
  return roles.includes(membership.role as UserRole)
}

'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization, requireRole } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

// ─── Kategorien ───────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const membership = await requireRole(['ADMIN'])
  const name = (formData.get('name') as string)?.trim()
  const family = (formData.get('family') as string) || 'WOODWIND'
  if (!name) return { error: 'Name ist Pflicht.' }

  const existing = await prisma.instrumentCategory.findUnique({
    where: { organizationId_name: { organizationId: membership.organizationId, name } },
    select: { id: true },
  })
  if (existing) return { error: 'Kategorie existiert bereits.' }

  await prisma.instrumentCategory.create({
    data: { organizationId: membership.organizationId, name, family: family as never },
  })
  revalidatePath('/settings/categories')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  await requireRole(['ADMIN'])

  const inUse = await prisma.instrument.count({ where: { categoryId } })
  if (inUse > 0) return { error: `Kategorie wird von ${inUse} Instrument(en) verwendet.` }

  await prisma.instrumentCategory.delete({ where: { id: categoryId } })
  revalidatePath('/settings/categories')
  return { success: true }
}

// ─── Marken ───────────────────────────────────────────────

export async function createBrand(formData: FormData) {
  const membership = await requireRole(['ADMIN'])
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name ist Pflicht.' }

  const existing = await prisma.instrumentBrand.findUnique({
    where: { organizationId_name: { organizationId: membership.organizationId, name } },
    select: { id: true },
  })
  if (existing) return { error: 'Marke existiert bereits.' }

  await prisma.instrumentBrand.create({
    data: { organizationId: membership.organizationId, name },
  })
  revalidatePath('/settings/brands')
  return { success: true }
}

export async function deleteBrand(brandId: string) {
  await requireRole(['ADMIN'])

  const inUse = await prisma.instrument.count({ where: { brandId } })
  if (inUse > 0) return { error: `Marke wird von ${inUse} Instrument(en) verwendet.` }

  await prisma.instrumentBrand.delete({ where: { id: brandId } })
  revalidatePath('/settings/brands')
  return { success: true }
}

// ─── Rollen ───────────────────────────────────────────────

export async function changeUserRole(memberId: string, newRole: string) {
  await requireRole(['ADMIN'])

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role: newRole as never },
  })
  revalidatePath('/settings/users')
  return { success: true }
}

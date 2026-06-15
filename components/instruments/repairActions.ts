'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createRepairEvent(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  const instrumentId = formData.get('instrumentId') as string
  const title = (formData.get('title') as string)?.trim()
  const description = formData.get('description') as string
  const repairDate = formData.get('repairDate') as string
  const costEstimate = formData.get('costEstimate') as string
  const actualCost = formData.get('actualCost') as string
  const status = formData.get('status') as string
  const setInRepair = formData.get('setInRepair') === 'on'

  if (!title) return { error: 'Titel ist Pflicht.' }

  const instrument = await prisma.instrument.findFirst({
    where: { id: instrumentId, organizationId: orgId },
  })
  if (!instrument) return { error: 'Instrument nicht gefunden.' }

  await prisma.instrumentRepairEvent.create({
    data: {
      instrumentId,
      title,
      description: description || null,
      repairDate: repairDate ? new Date(repairDate) : new Date(),
      costEstimate: costEstimate ? parseFloat(costEstimate) : null,
      actualCost: actualCost ? parseFloat(actualCost) : null,
      status: status || 'not_started',
    },
  })

  if (setInRepair && instrument.status !== 'IN_REPAIR') {
    await prisma.instrument.update({
      where: { id: instrumentId },
      data: { status: 'IN_REPAIR' },
    })
    await prisma.instrumentStatusHistory.create({
      data: {
        instrumentId,
        oldStatus: instrument.status as never,
        newStatus: 'IN_REPAIR',
        reason: `Reparatur: ${title}`,
        changedByUserId: user?.id,
      },
    })
  }

  revalidatePath(`/instruments/${instrumentId}`)
  return { success: true }
}

export async function createAccessory(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const instrumentId = formData.get('instrumentId') as string
  const name = (formData.get('name') as string)?.trim()
  const description = formData.get('description') as string
  const serialNumber = formData.get('serialNumber') as string
  const condition = formData.get('condition') as string
  const included = formData.get('included') !== 'false'

  if (!name) return { error: 'Name ist Pflicht.' }

  const instrument = await prisma.instrument.findFirst({
    where: { id: instrumentId, organizationId: orgId },
    select: { id: true },
  })
  if (!instrument) return { error: 'Instrument nicht gefunden.' }

  await prisma.instrumentAccessory.create({
    data: {
      instrumentId,
      name,
      description: description || null,
      serialNumber: serialNumber || null,
      condition: condition || null,
      included,
    },
  })

  revalidatePath(`/instruments/${instrumentId}`)
  return { success: true }
}

export async function deleteAccessory(accessoryId: string, instrumentId: string) {
  await requireOrganization()
  await prisma.instrumentAccessory.delete({ where: { id: accessoryId } })
  revalidatePath(`/instruments/${instrumentId}`)
  return { success: true }
}

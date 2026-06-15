'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { getStatusLabel } from '@/lib/status'
import { revalidatePath } from 'next/cache'

interface ChangeStatusInput {
  instrumentId: string
  newStatus: string
  reason?: string
}

export async function changeInstrumentStatus({ instrumentId, newStatus, reason }: ChangeStatusInput) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  const instrument = await prisma.instrument.findFirst({
    where: { id: instrumentId, organizationId: orgId },
    select: { id: true },
  })

  if (!instrument) {
    return { error: 'Instrument nicht gefunden.' }
  }

  if (newStatus === 'OVERHAUL_EXTERNAL' && !reason?.trim()) {
    return { error: 'Bei Generalüberholung ist ein Grund Pflicht.' }
  }

  const oldStatus = instrument.status

  await prisma.instrument.update({
    where: { id: instrumentId },
    data: { status: newStatus as never },
  })

  await prisma.instrumentStatusHistory.create({
    data: {
      instrumentId,
      oldStatus: oldStatus as never,
      newStatus: newStatus as never,
      reason: reason || null,
      changedByUserId: user?.id,
    },
  })

  // Notiz mit deutschem Statusnamen
  if (reason?.trim()) {
    await prisma.note.create({
      data: {
        organizationId: orgId,
        instrumentId,
        noteType: 'CONDITION',
        content: `Statusänderung zu „${getStatusLabel(newStatus)}": ${reason}`,
        createdByUserId: user?.id,
      },
    })
  }

  revalidatePath(`/instruments/${instrumentId}`)
  revalidatePath('/instruments')
  revalidatePath('/dashboard')

  return { success: true }
}

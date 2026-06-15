'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function processReturn(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  const rentalId = formData.get('rentalId') as string
  const instrumentId = formData.get('instrumentId') as string
  const returnDate = formData.get('returnDate') as string
  const targetStatus = formData.get('targetStatus') as string
  const notes = formData.get('notes') as string
  const depositReturned = formData.get('depositReturned') === 'on'
  const depositSettled = formData.get('depositSettled') === 'on'
  const depositReturnedAt = formData.get('depositReturnedAt') as string

  if (!returnDate) return { error: 'Rückgabedatum ist Pflicht.' }
  if (!targetStatus) return { error: 'Zielstatus ist Pflicht.' }
  if (targetStatus === 'OVERHAUL_EXTERNAL' && !notes?.trim()) {
    return { error: 'Bei Generalüberholung ist eine Notiz Pflicht.' }
  }

  const rental = await prisma.rentalContract.findFirst({
    where: { id: rentalId, organizationId: orgId, status: 'ACTIVE' },
    include: { instrument: true, customer: true },
  })
  if (!rental) return { error: 'Aktiver Mietvertrag nicht gefunden.' }

  const instrument = await prisma.instrument.findFirst({
    where: { id: instrumentId, organizationId: orgId },
  })
  if (!instrument) return { error: 'Instrument nicht gefunden.' }

  const endDate = new Date(returnDate)

  await prisma.rentalContract.update({
    where: { id: rentalId },
    data: {
      status: 'ENDED',
      endDate,
      depositReturnedAt: depositReturned && depositReturnedAt
        ? new Date(depositReturnedAt)
        : null,
      depositNotes: depositSettled
        ? 'Kaution verrechnet'
        : depositReturned
        ? 'Kaution zurückgegeben'
        : null,
    },
  })

  await prisma.instrument.update({
    where: { id: instrumentId },
    data: { status: targetStatus as never },
  })

  await prisma.instrumentStatusHistory.create({
    data: {
      instrumentId,
      oldStatus: 'RENTED',
      newStatus: targetStatus as never,
      reason: notes?.trim() || `Rückgabe von ${rental.customer.firstName} ${rental.customer.lastName}`,
      changedByUserId: user?.id,
    },
  })

  if (notes?.trim()) {
    await prisma.note.create({
      data: {
        organizationId: orgId,
        instrumentId,
        noteType: 'RENTAL',
        content: `Rückgabe am ${endDate.toLocaleDateString('de-DE')}: ${notes.trim()}`,
        createdByUserId: user?.id,
      },
    })
  }

  // Cache invalidieren
  revalidatePath(`/rentals/${rentalId}`)
  revalidatePath(`/rentals`)
  revalidatePath(`/instruments/${instrumentId}`)
  revalidatePath(`/instruments`)
  revalidatePath(`/customers`)
  revalidatePath(`/dashboard`)

  return { success: true }
}

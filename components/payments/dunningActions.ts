'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface RecordDunningInput {
  paymentId: string
  customerId: string
  level: number
  fee: number
  notes?: string
}

export async function recordDunning({ paymentId, customerId, level, fee, notes }: RecordDunningInput) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  // Mahnung in DB speichern
  await prisma.dunningRecord.create({
    data: {
      organizationId: orgId,
      paymentId,
      customerId,
      level,
      fee,
      sentByUserId: user?.id,
      notes: notes || null,
    },
  })

  // In Notizen beim Kunden erfassen
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { instrument: true },
  })

  if (payment) {
    const action = level === 0
      ? 'Zahlungserinnerung'
      : `${level}. Mahnung${fee > 0 ? ` (+${fee.toFixed(2)} €)` : ''}`

    await prisma.note.create({
      data: {
        organizationId: orgId,
        customerId,
        instrumentId: payment.instrumentId,
        noteType: 'CUSTOMER',
        content: `${action} für Zahlung vom ${new Date(payment.dueDate).toLocaleDateString('de-DE')} (${payment.amount} €, ${payment.paymentReference ?? ''})`,
        createdByUserId: user?.id,
      },
    })
  }

  revalidatePath('/payments')
  return { success: true }
}

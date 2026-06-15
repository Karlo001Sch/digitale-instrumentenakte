'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/audit'
import { getCurrentUser } from '@/lib/auth'

export async function markPaymentAsPaid(paymentId: string, notes?: string) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, organizationId: orgId },
  })
  if (!payment) return { error: 'Zahlung nicht gefunden.' }
  if (payment.status === 'PAID') return { error: 'Zahlung bereits als bezahlt markiert.' }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      notes: notes || null,
    },
  })

  const user = await getCurrentUser()
  await createAuditLog({
    organizationId: payment.organizationId,
    userId: user?.id,
    entityType: 'Payment',
    entityId: paymentId,
    action: 'MARK_PAID',
    newData: { status: 'PAID', paidAt: new Date() },
  })

  revalidatePath('/payments')
  revalidatePath('/dashboard')

  return { success: true }
}

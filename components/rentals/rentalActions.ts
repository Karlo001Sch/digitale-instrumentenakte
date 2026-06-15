'use server'

import { addMonths, isAfter } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { generatePaymentReference } from '@/lib/payment'
import { createAuditLog } from '@/lib/audit'
import { z } from 'zod'

function getRentalPaymentDueDates(startDate: Date, untilDate: Date) {
  const dueDates: Date[] = []
  let currentDueDate = startDate

  if (isAfter(currentDueDate, untilDate)) {
    return [currentDueDate]
  }

  while (!isAfter(currentDueDate, untilDate)) {
    dueDates.push(currentDueDate)
    currentDueDate = addMonths(currentDueDate, 1)
  }

  return dueDates
}

const RentalSchema = z.object({
  customerId: z.string().min(1, 'Kunde ist Pflicht'),
  instrumentId: z.string().min(1, 'Instrument ist Pflicht'),
  startDate: z.string().min(1, 'Mietbeginn ist Pflicht'),
  monthlyRent: z.coerce.number().min(0, 'Monatsmiete muss >= 0 sein'),
  depositAmount: z.coerce.number().min(0).optional(),
  depositReceivedAt: z.string().optional(),
  paymentMethod: z.string().min(1, 'Zahlungsart ist Pflicht'),
  firstMonthCash: z.boolean().default(false),
  notes: z.string().optional(),
})

export async function createRental(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  const raw = {
    customerId: formData.get('customerId') as string,
    instrumentId: formData.get('instrumentId') as string,
    startDate: formData.get('startDate') as string,
    monthlyRent: formData.get('monthlyRent') as string,
    depositAmount: formData.get('depositAmount') as string || undefined,
    depositReceivedAt: formData.get('depositReceivedAt') as string || undefined,
    paymentMethod: formData.get('paymentMethod') as string,
    firstMonthCash: formData.get('firstMonthCash') === 'on',
    notes: formData.get('notes') as string || undefined,
  }

  const parsed = RentalSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  // Instrument prüfen
  const instrument = await prisma.instrument.findFirst({
    where: { id: parsed.data.instrumentId, organizationId: orgId },
    select: { id: true, status: true, internalId: true },
  })
  if (!instrument) return { error: 'Instrument nicht gefunden.' }

  // Prüfen ob bereits aktiv vermietet
  const activeRental = await prisma.rentalContract.findFirst({
    where: { instrumentId: parsed.data.instrumentId, status: 'ACTIVE' },
    select: { id: true },
  })
  if (activeRental) return { error: 'Dieses Instrument ist bereits aktiv vermietet.' }

  // Kunde prüfen
  const customer = await prisma.customer.findFirst({
    where: { id: parsed.data.customerId, organizationId: orgId },
    select: { id: true, firstName: true, lastName: true },
  })
  if (!customer) return { error: 'Kunde nicht gefunden.' }

  // Verwendungszweck generieren
  const startDate = new Date(parsed.data.startDate)
  const paymentReference = generatePaymentReference(
    customer.firstName,
    customer.lastName,
    startDate,
    instrument.internalId
  )

  // Ersten Monat Zahlungsart bestimmen
  const firstMonthMethod = parsed.data.firstMonthCash
    ? 'CASH'
    : parsed.data.paymentMethod

  // Mietvertrag erstellen
  const rental = await prisma.rentalContract.create({
    data: {
      organizationId: orgId,
      customerId: parsed.data.customerId,
      instrumentId: parsed.data.instrumentId,
      startDate,
      monthlyRent: parsed.data.monthlyRent,
      depositAmount: parsed.data.depositAmount ?? null,
      depositReceivedAt: parsed.data.depositReceivedAt
        ? new Date(parsed.data.depositReceivedAt)
        : null,
      paymentMethod: parsed.data.paymentMethod as never,
      paymentReference,
      firstMonthCash: parsed.data.firstMonthCash,
      status: 'ACTIVE',
      notes: parsed.data.notes || null,
    },
  })

  // Zahlungen für alle Monate seit Vertragsbeginn erzeugen
  const paymentDueDates = getRentalPaymentDueDates(startDate, new Date())
  const paymentItems = paymentDueDates.map((dueDate, index) => ({
    organizationId: orgId,
    rentalContractId: rental.id,
    customerId: parsed.data.customerId,
    instrumentId: parsed.data.instrumentId,
    dueDate,
    amount: parsed.data.monthlyRent,
    method: (index === 0 ? firstMonthMethod : parsed.data.paymentMethod) as never,
    status: 'OPEN',
    paymentReference,
  }))

  await prisma.payment.createMany({
    data: paymentItems,
  })

  // Instrument auf RENTED setzen
  await prisma.instrument.update({
    where: { id: parsed.data.instrumentId },
    data: { status: 'RENTED' },
  })

  // Statushistorie
  await prisma.instrumentStatusHistory.create({
    data: {
      instrumentId: parsed.data.instrumentId,
      oldStatus: instrument.status as never,
      newStatus: 'RENTED',
      reason: `Vermietet an ${customer.firstName} ${customer.lastName}`,
      changedByUserId: user?.id,
    },
  })

  // Audit Log
  await createAuditLog({
    organizationId: orgId,
    userId: user?.id,
    entityType: 'RentalContract',
    entityId: rental.id,
    action: 'CREATE',
    newData: { customerId: parsed.data.customerId, instrumentId: parsed.data.instrumentId, paymentReference },
  })

  return { id: rental.id }
}

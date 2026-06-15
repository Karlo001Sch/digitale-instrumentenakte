'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { InstrumentSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export async function createInstrument(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  const raw = {
    internalId: formData.get('internalId') as string,
    label: formData.get('label') as string || undefined,
    categoryId: formData.get('categoryId') as string || undefined,
    brandId: formData.get('brandId') as string || undefined,
    model: formData.get('model') as string || undefined,
    serialNumber: formData.get('serialNumber') as string || undefined,
    purchaseDate: formData.get('purchaseDate') as string || undefined,
    purchasePrice: formData.get('purchasePrice') as string || undefined,
    currentValue: formData.get('currentValue') as string || undefined,
    defaultMonthlyRent: formData.get('defaultMonthlyRent') as string || undefined,
    defaultDeposit: formData.get('defaultDeposit') as string || undefined,
    conditionRating: formData.get('conditionRating') as string || undefined,
    status: formData.get('status') as string,
    location: formData.get('location') as string || undefined,
    generalNotes: formData.get('generalNotes') as string || undefined,
  }

  const parsed = InstrumentSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { error: firstError.message }
  }

  // Prüfen ob internalId bereits existiert
  const existing = await prisma.instrument.findUnique({
    where: { organizationId_internalId: { organizationId: orgId, internalId: parsed.data.internalId } },
  })
  if (existing) {
    return { error: `Die ID "${parsed.data.internalId}" ist bereits vergeben.` }
  }

  const toDecimal = (val: unknown) => (val && val !== '' ? Number(val) : undefined)
  const toInt = (val: unknown) => (val && val !== '' ? parseInt(String(val)) : undefined)

  const instrument = await prisma.instrument.create({
    data: {
      organizationId: orgId,
      internalId: parsed.data.internalId,
      label: parsed.data.label || null,
      categoryId: parsed.data.categoryId || null,
      brandId: parsed.data.brandId || null,
      model: parsed.data.model || null,
      serialNumber: parsed.data.serialNumber || null,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      purchasePrice: toDecimal(parsed.data.purchasePrice),
      currentValue: toDecimal(parsed.data.currentValue),
      defaultMonthlyRent: toDecimal(parsed.data.defaultMonthlyRent),
      defaultDeposit: toDecimal(parsed.data.defaultDeposit),
      conditionRating: toInt(parsed.data.conditionRating),
      status: parsed.data.status as never,
      location: parsed.data.location || null,
      generalNotes: parsed.data.generalNotes || null,
    },
  })

  // Initiale Statushistorie
  await prisma.instrumentStatusHistory.create({
    data: {
      instrumentId: instrument.id,
      newStatus: instrument.status,
      reason: 'Instrument neu angelegt',
      changedByUserId: user?.id,
    },
  })

  return { id: instrument.id }
}

export async function updateInstrument(instrumentId: string, formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const raw = {
    internalId: formData.get('internalId') as string,
    label: formData.get('label') as string || undefined,
    categoryId: formData.get('categoryId') as string || undefined,
    brandId: formData.get('brandId') as string || undefined,
    model: formData.get('model') as string || undefined,
    serialNumber: formData.get('serialNumber') as string || undefined,
    purchaseDate: formData.get('purchaseDate') as string || undefined,
    purchasePrice: formData.get('purchasePrice') as string || undefined,
    currentValue: formData.get('currentValue') as string || undefined,
    defaultMonthlyRent: formData.get('defaultMonthlyRent') as string || undefined,
    defaultDeposit: formData.get('defaultDeposit') as string || undefined,
    conditionRating: formData.get('conditionRating') as string || undefined,
    status: formData.get('status') as string,
    location: formData.get('location') as string || undefined,
    generalNotes: formData.get('generalNotes') as string || undefined,
  }

  const parsed = InstrumentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  // Prüfen ob internalId von einem anderen Instrument verwendet wird
  const existing = await prisma.instrument.findUnique({
    where: { organizationId_internalId: { organizationId: orgId, internalId: parsed.data.internalId } },
  })
  if (existing && existing.id !== instrumentId) {
    return { error: `Die ID "${parsed.data.internalId}" ist bereits vergeben.` }
  }

  const toDecimal = (val: unknown) => (val && val !== '' ? Number(val) : undefined)
  const toInt = (val: unknown) => (val && val !== '' ? parseInt(String(val)) : undefined)

  const instrument = await prisma.instrument.update({
    where: { id: instrumentId },
    data: {
      internalId: parsed.data.internalId,
      label: parsed.data.label || null,
      categoryId: parsed.data.categoryId || null,
      brandId: parsed.data.brandId || null,
      model: parsed.data.model || null,
      serialNumber: parsed.data.serialNumber || null,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      purchasePrice: toDecimal(parsed.data.purchasePrice),
      currentValue: toDecimal(parsed.data.currentValue),
      defaultMonthlyRent: toDecimal(parsed.data.defaultMonthlyRent),
      defaultDeposit: toDecimal(parsed.data.defaultDeposit),
      conditionRating: toInt(parsed.data.conditionRating),
      status: parsed.data.status as never,
      location: parsed.data.location || null,
      generalNotes: parsed.data.generalNotes || null,
    },
  })

  return { id: instrument.id }
}

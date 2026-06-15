'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { CustomerSchema } from '@/lib/validators'

export async function createCustomer(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    street: formData.get('street') as string || undefined,
    postalCode: formData.get('postalCode') as string || undefined,
    city: formData.get('city') as string || undefined,
    phone: formData.get('phone') as string || undefined,
    email: formData.get('email') as string || undefined,
    customerType: formData.get('customerType') as string || undefined,
    iban: formData.get('iban') as string || undefined,
    directDebitMandateExists: formData.get('directDebitMandateExists') === 'on',
    directDebitMandateDate: formData.get('directDebitMandateDate') as string || undefined,
    notes: formData.get('notes') as string || undefined,
  }

  const parsed = CustomerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const customer = await prisma.customer.create({
    data: {
      organizationId: orgId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      street: parsed.data.street || null,
      postalCode: parsed.data.postalCode || null,
      city: parsed.data.city || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      customerType: parsed.data.customerType || null,
      iban: parsed.data.iban || null,
      directDebitMandateExists: parsed.data.directDebitMandateExists,
      directDebitMandateDate: parsed.data.directDebitMandateDate
        ? new Date(parsed.data.directDebitMandateDate)
        : null,
      notes: parsed.data.notes || null,
    },
  })

  return { id: customer.id }
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId

  const existing = await prisma.customer.findFirst({
    where: { id: customerId, organizationId: orgId },
  })
  if (!existing) return { error: 'Kunde nicht gefunden.' }

  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    street: formData.get('street') as string || undefined,
    postalCode: formData.get('postalCode') as string || undefined,
    city: formData.get('city') as string || undefined,
    phone: formData.get('phone') as string || undefined,
    email: formData.get('email') as string || undefined,
    customerType: formData.get('customerType') as string || undefined,
    iban: formData.get('iban') as string || undefined,
    directDebitMandateExists: formData.get('directDebitMandateExists') === 'on',
    directDebitMandateDate: formData.get('directDebitMandateDate') as string || undefined,
    notes: formData.get('notes') as string || undefined,
  }

  const parsed = CustomerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      street: parsed.data.street || null,
      postalCode: parsed.data.postalCode || null,
      city: parsed.data.city || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      customerType: parsed.data.customerType || null,
      iban: parsed.data.iban || null,
      directDebitMandateExists: parsed.data.directDebitMandateExists,
      directDebitMandateDate: parsed.data.directDebitMandateDate
        ? new Date(parsed.data.directDebitMandateDate)
        : null,
      notes: parsed.data.notes || null,
    },
  })

  return { id: customer.id }
}

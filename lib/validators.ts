import { z } from 'zod'

export const InstrumentSchema = z.object({
  internalId: z.string().min(1, 'Interne ID ist Pflicht'),
  label: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal('')),
  currentValue: z.coerce.number().min(0).optional().or(z.literal('')),
  defaultMonthlyRent: z.coerce.number().min(0).optional().or(z.literal('')),
  defaultDeposit: z.coerce.number().min(0).optional().or(z.literal('')),
  conditionRating: z.coerce.number().min(1).max(5).optional().or(z.literal('')),
  status: z.string().min(1, 'Status ist Pflicht'),
  location: z.string().optional(),
  generalNotes: z.string().optional(),
})

export const CustomerSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist Pflicht'),
  lastName: z.string().min(1, 'Nachname ist Pflicht'),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Ungültige E-Mail').optional().or(z.literal('')),
  customerType: z.string().optional(),
  iban: z.string().optional(),
  directDebitMandateExists: z.boolean().default(false),
  directDebitMandateDate: z.string().optional(),
  notes: z.string().optional(),
})

export type InstrumentFormValues = z.infer<typeof InstrumentSchema>
export type CustomerFormValues = z.infer<typeof CustomerSchema>

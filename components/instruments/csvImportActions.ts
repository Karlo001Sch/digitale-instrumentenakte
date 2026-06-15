'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'

const STATUS_MAP: Record<string, string> = {
  'vermietfähig': 'AVAILABLE', 'available': 'AVAILABLE',
  'vermietet': 'RENTED', 'rented': 'RENTED',
  'in reparatur': 'IN_REPAIR', 'in_repair': 'IN_REPAIR',
  'nicht vorhanden': 'AWAY_OR_MISSING', 'nicht vorhanden / unterwegs': 'AWAY_OR_MISSING', 'away_or_missing': 'AWAY_OR_MISSING',
  'zur generalüberholung mitgegeben': 'OVERHAUL_EXTERNAL', 'overhaul_external': 'OVERHAUL_EXTERNAL',
  'reserviert': 'RESERVED', 'reserved': 'RESERVED',
  'verkauft': 'SOLD', 'sold': 'SOLD',
  'ausgemustert': 'RETIRED', 'retired': 'RETIRED',
}

interface CsvRow {
  internalId: string
  label: string
  category: string
  brand: string
  model: string
  serialNumber: string
  status: string
  currentValue: string
  defaultMonthlyRent: string
  defaultDeposit: string
  location: string
  generalNotes: string
}

export async function importInstrumentsCsv(formData: FormData) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  const rowsJson = formData.get('rows') as string
  const rows: CsvRow[] = JSON.parse(rowsJson)

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  // 1. Batch: Duplikate prüfen (1 Query)
  const existingIds = new Set(
    (
      await prisma.instrument.findMany({
        where: {
          organizationId: orgId,
          internalId: { in: rows.map((r) => r.internalId.trim()).filter(Boolean) },
        },
        select: { internalId: true },
      })
    ).map((i) => i.internalId)
  )

  // 2. Batch: Kategorien und Brands sammeln (2 Queries)
  const categoryNames = new Set(rows.map((r) => r.category?.trim()).filter(Boolean))
  const brandNames = new Set(rows.map((r) => r.brand?.trim()).filter(Boolean))

  const existingCategories = new Map(
    (
      await prisma.instrumentCategory.findMany({
        where: { organizationId: orgId, name: { in: Array.from(categoryNames) } },
        select: { id: true, name: true },
      })
    ).map((c) => [c.name, c.id])
  )

  const existingBrands = new Map(
    (
      await prisma.instrumentBrand.findMany({
        where: { organizationId: orgId, name: { in: Array.from(brandNames) } },
        select: { id: true, name: true },
      })
    ).map((b) => [b.name, b.id])
  )

  // 3. Batch: Neue Kategorien und Brands erstellen
  const newCategories = Array.from(categoryNames).filter((name) => !existingCategories.has(name))
  const newBrands = Array.from(brandNames).filter((name) => !existingBrands.has(name))

  const createdCategories = newCategories.length
    ? await Promise.all(
        newCategories.map((name) =>
          prisma.instrumentCategory.create({
            data: { organizationId: orgId, name, family: 'WOODWIND' },
            select: { id: true, name: true },
          })
        )
      )
    : []

  const createdBrands = newBrands.length
    ? await Promise.all(
        newBrands.map((name) =>
          prisma.instrumentBrand.create({
            data: { organizationId: orgId, name },
            select: { id: true, name: true },
          })
        )
      )
    : []

  // Merge maps
  createdCategories.forEach((c) => existingCategories.set(c.name, c.id))
  createdBrands.forEach((b) => existingBrands.set(b.name, b.id))

  // 4. Batch: Alle Instrumente und Status-Histories erstellen
  const toCreate: Parameters<typeof prisma.instrument.createMany>[0]['data'] = []
  const toCreateStatuses: typeof rows[] = []

  for (const row of rows) {
    if (!row.internalId?.trim()) {
      errors.push(`Zeile übersprungen: Keine internalId`)
      continue
    }

    if (existingIds.has(row.internalId.trim())) {
      skipped++
      continue
    }

    const categoryId = row.category?.trim() ? existingCategories.get(row.category.trim()) : null
    const brandId = row.brand?.trim() ? existingBrands.get(row.brand.trim()) : null
    const statusKey = (row.status ?? '').toLowerCase().trim()
    const mappedStatus = STATUS_MAP[statusKey] ?? 'AVAILABLE'

    toCreate.push({
      organizationId: orgId,
      internalId: row.internalId.trim(),
      label: row.label?.trim() || null,
      categoryId: categoryId || null,
      brandId: brandId || null,
      model: row.model?.trim() || null,
      serialNumber: row.serialNumber?.trim() || null,
      currentValue: row.currentValue ? parseFloat(row.currentValue) : null,
      defaultMonthlyRent: row.defaultMonthlyRent ? parseFloat(row.defaultMonthlyRent) : null,
      defaultDeposit: row.defaultDeposit ? parseFloat(row.defaultDeposit) : null,
      status: mappedStatus as never,
      location: row.location?.trim() || null,
      generalNotes: row.generalNotes?.trim() || null,
    })
    toCreateStatuses.push({ ...row, status: mappedStatus })
  }

  // 5. Batch Insert Instrumente + Status Histories
  if (toCreate.length > 0) {
    try {
      const created = await prisma.instrument.createMany({
        data: toCreate,
        skipDuplicates: false,
      })

      // Fetch IDs of created instruments
      const createdInstruments = await prisma.instrument.findMany({
        where: { organizationId: orgId, internalId: { in: toCreate.map((i) => i.internalId) } },
        select: { id: true, internalId: true },
      })

      const idMap = new Map(createdInstruments.map((i) => [i.internalId, i.id]))

      // Batch create status histories
      const statusHistoriesToCreate = toCreateStatuses.map((row) => ({
        instrumentId: idMap.get(row.internalId)!,
        newStatus: (STATUS_MAP[(row.status ?? '').toLowerCase().trim()] ?? 'AVAILABLE') as never,
        reason: 'CSV Import',
        changedByUserId: user?.id,
      }))

      if (statusHistoriesToCreate.length > 0) {
        await prisma.instrumentStatusHistory.createMany({
          data: statusHistoriesToCreate,
        })
      }

      imported = created.count
    } catch (e) {
      errors.push(`Fehler beim Batch-Import: ${e instanceof Error ? e.message : 'Unbekannt'}`)
    }
  }

  return { imported, skipped, errors }
}

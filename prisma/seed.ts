import { PrismaClient, InstrumentStatus, PaymentMethod, PaymentStatus, RentalContractStatus, InstrumentFamily } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starte Seed...')

  // ─────────────────────────────────────────────
  // ORGANISATION
  // ─────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: 'org-werkstatt-01' },
    update: {},
    create: {
      id: 'org-werkstatt-01',
      name: 'Musikwerkstatt Muster',
      type: 'WOODWIND_WORKSHOP',
    },
  })
  console.log(`✓ Organisation: ${org.name}`)

  // ─────────────────────────────────────────────
  // KATEGORIEN
  // ─────────────────────────────────────────────
  const kategorien = await Promise.all([
    prisma.instrumentCategory.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Altsaxophon' } },
      update: {},
      create: { organizationId: org.id, name: 'Altsaxophon', family: InstrumentFamily.WOODWIND },
    }),
    prisma.instrumentCategory.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Tenorsaxophon' } },
      update: {},
      create: { organizationId: org.id, name: 'Tenorsaxophon', family: InstrumentFamily.WOODWIND },
    }),
    prisma.instrumentCategory.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Klarinette' } },
      update: {},
      create: { organizationId: org.id, name: 'Klarinette', family: InstrumentFamily.WOODWIND },
    }),
    prisma.instrumentCategory.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Querflöte' } },
      update: {},
      create: { organizationId: org.id, name: 'Querflöte', family: InstrumentFamily.WOODWIND },
    }),
  ])
  const [katAlt, katTenor, katKlar, katFloete] = kategorien
  console.log(`✓ ${kategorien.length} Kategorien angelegt`)

  // ─────────────────────────────────────────────
  // MARKEN
  // ─────────────────────────────────────────────
  const marken = await Promise.all([
    prisma.instrumentBrand.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Yamaha' } },
      update: {},
      create: { organizationId: org.id, name: 'Yamaha' },
    }),
    prisma.instrumentBrand.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Selmer' } },
      update: {},
      create: { organizationId: org.id, name: 'Selmer' },
    }),
    prisma.instrumentBrand.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Buffet Crampon' } },
      update: {},
      create: { organizationId: org.id, name: 'Buffet Crampon' },
    }),
    prisma.instrumentBrand.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Jupiter' } },
      update: {},
      create: { organizationId: org.id, name: 'Jupiter' },
    }),
  ])
  const [markeYamaha, markeSelmer, markeBuffet, markeJupiter] = marken
  console.log(`✓ ${marken.length} Marken angelegt`)

  // ─────────────────────────────────────────────
  // INSTRUMENTE
  // ─────────────────────────────────────────────
  const instrumente = await Promise.all([
    // Altsaxophone
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'AltSax01' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'AltSax01',
        label: 'Altsaxophon 01',
        categoryId: katAlt.id,
        brandId: markeYamaha.id,
        model: 'YAS-280',
        serialNumber: 'J65432',
        currentValue: 450.00,
        defaultMonthlyRent: 28.00,
        defaultDeposit: 80.00,
        conditionRating: 4,
        status: InstrumentStatus.RENTED,
        location: 'Regal A1',
      },
    }),
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'AltSax02' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'AltSax02',
        label: 'Altsaxophon 02',
        categoryId: katAlt.id,
        brandId: markeSelmer.id,
        model: 'AS42',
        serialNumber: 'S12341',
        currentValue: 620.00,
        defaultMonthlyRent: 32.00,
        defaultDeposit: 100.00,
        conditionRating: 3,
        status: InstrumentStatus.RENTED,
        location: 'Regal A1',
      },
    }),
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'AltSax03' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'AltSax03',
        label: 'Altsaxophon 03',
        categoryId: katAlt.id,
        brandId: markeJupiter.id,
        model: 'JAS-500',
        serialNumber: 'JU98765',
        currentValue: 380.00,
        defaultMonthlyRent: 25.00,
        defaultDeposit: 75.00,
        conditionRating: 3,
        status: InstrumentStatus.AVAILABLE,
        location: 'Regal A2',
      },
    }),
    // Tenorsaxophone
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'TenSax01' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'TenSax01',
        label: 'Tenorsaxophon 01',
        categoryId: katTenor.id,
        brandId: markeYamaha.id,
        model: 'YTS-280',
        serialNumber: 'T44321',
        currentValue: 550.00,
        defaultMonthlyRent: 34.00,
        defaultDeposit: 100.00,
        conditionRating: 4,
        status: InstrumentStatus.RENTED,
        location: 'Regal B1',
      },
    }),
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'TenSax02' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'TenSax02',
        label: 'Tenorsaxophon 02',
        categoryId: katTenor.id,
        brandId: markeSelmer.id,
        model: 'TS44',
        serialNumber: 'S55678',
        currentValue: 710.00,
        defaultMonthlyRent: 38.00,
        defaultDeposit: 120.00,
        conditionRating: 2,
        status: InstrumentStatus.IN_REPAIR,
        location: 'Werkstatt',
        generalNotes: 'Oktavklappe klemmt, wird gerade repariert.',
      },
    }),
    // Klarinetten
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'Klar01' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'Klar01',
        label: 'Klarinette 01',
        categoryId: katKlar.id,
        brandId: markeBuffet.id,
        model: 'B12',
        serialNumber: 'BC11223',
        currentValue: 320.00,
        defaultMonthlyRent: 22.00,
        defaultDeposit: 60.00,
        conditionRating: 4,
        status: InstrumentStatus.AVAILABLE,
        location: 'Regal C1',
      },
    }),
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'Klar02' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'Klar02',
        label: 'Klarinette 02',
        categoryId: katKlar.id,
        brandId: markeYamaha.id,
        model: 'YCL-255',
        serialNumber: 'YK33445',
        currentValue: 290.00,
        defaultMonthlyRent: 20.00,
        defaultDeposit: 60.00,
        conditionRating: 5,
        status: InstrumentStatus.AVAILABLE,
        location: 'Regal C1',
      },
    }),
    // Querflöten
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'Floete01' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'Floete01',
        label: 'Querflöte 01',
        categoryId: katFloete.id,
        brandId: markeYamaha.id,
        model: 'YFL-222',
        serialNumber: 'YF77889',
        currentValue: 280.00,
        defaultMonthlyRent: 20.00,
        defaultDeposit: 60.00,
        conditionRating: 3,
        status: InstrumentStatus.OVERHAUL_EXTERNAL,
        location: 'Extern',
        generalNotes: 'Zur Generalüberholung bei Werkstatt Müller. Kostenlos mitgegeben.',
      },
    }),
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'Floete02' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'Floete02',
        label: 'Querflöte 02',
        categoryId: katFloete.id,
        brandId: markeJupiter.id,
        model: 'JFL-700',
        serialNumber: 'JF22334',
        currentValue: 340.00,
        defaultMonthlyRent: 22.00,
        defaultDeposit: 65.00,
        conditionRating: 4,
        status: InstrumentStatus.AVAILABLE,
        location: 'Regal D1',
      },
    }),
    prisma.instrument.upsert({
      where: { organizationId_internalId: { organizationId: org.id, internalId: 'AltSax04' } },
      update: {},
      create: {
        organizationId: org.id,
        internalId: 'AltSax04',
        label: 'Altsaxophon 04',
        categoryId: katAlt.id,
        brandId: markeJupiter.id,
        model: 'JAS-500Q',
        serialNumber: 'JU44556',
        currentValue: 395.00,
        defaultMonthlyRent: 26.00,
        defaultDeposit: 80.00,
        conditionRating: 2,
        status: InstrumentStatus.AWAY_OR_MISSING,
        generalNotes: 'Verbleib unklar, zuletzt bei Schüler Huber gesehen.',
      },
    }),
  ])
  console.log(`✓ ${instrumente.length} Instrumente angelegt`)

  const [altSax01, altSax02, , tenSax01] = instrumente

  // ─────────────────────────────────────────────
  // KUNDEN
  // ─────────────────────────────────────────────
  const kunden = await Promise.all([
    prisma.customer.upsert({
      where: { id: 'kunde-01' },
      update: {},
      create: {
        id: 'kunde-01',
        organizationId: org.id,
        firstName: 'Bernd',
        lastName: 'Koch',
        street: 'Hauptstraße 12',
        postalCode: '70173',
        city: 'Stuttgart',
        phone: '0711 123456',
        email: 'bernd.koch@example.de',
        iban: 'DE89370400440532013000',
        directDebitMandateExists: true,
        directDebitMandateDate: new Date('2024-09-01'),
      },
    }),
    prisma.customer.upsert({
      where: { id: 'kunde-02' },
      update: {},
      create: {
        id: 'kunde-02',
        organizationId: org.id,
        firstName: 'Maria',
        lastName: 'Schneider',
        street: 'Gartenweg 5',
        postalCode: '70374',
        city: 'Stuttgart',
        phone: '0711 654321',
        email: 'maria.schneider@example.de',
        iban: 'DE21700519950000007229',
        directDebitMandateExists: true,
        directDebitMandateDate: new Date('2024-11-15'),
      },
    }),
    prisma.customer.upsert({
      where: { id: 'kunde-03' },
      update: {},
      create: {
        id: 'kunde-03',
        organizationId: org.id,
        firstName: 'Thomas',
        lastName: 'Huber',
        street: 'Schillerplatz 3',
        postalCode: '70182',
        city: 'Stuttgart',
        phone: '0711 987654',
        email: 'thomas.huber@example.de',
        directDebitMandateExists: false,
      },
    }),
    prisma.customer.upsert({
      where: { id: 'kunde-04' },
      update: {},
      create: {
        id: 'kunde-04',
        organizationId: org.id,
        firstName: 'Anna',
        lastName: 'Müller',
        street: 'Rosengasse 8',
        postalCode: '70193',
        city: 'Stuttgart',
        phone: '0711 112233',
        email: 'anna.mueller@example.de',
        iban: 'DE87200400600100000555',
        directDebitMandateExists: true,
        directDebitMandateDate: new Date('2025-01-10'),
      },
    }),
    prisma.customer.upsert({
      where: { id: 'kunde-05' },
      update: {},
      create: {
        id: 'kunde-05',
        organizationId: org.id,
        firstName: 'Felix',
        lastName: 'Wagner',
        street: 'Mozartstraße 21',
        postalCode: '70180',
        city: 'Stuttgart',
        phone: '0711 445566',
        email: 'felix.wagner@example.de',
        directDebitMandateExists: false,
        notes: 'Zahlt immer bar, kommt monatlich vorbei.',
      },
    }),
  ])
  const [kundeKoch, kundeSchneider, , kundeMueller] = kunden
  console.log(`✓ ${kunden.length} Kunden angelegt`)

  // ─────────────────────────────────────────────
  // MIETVERTRÄGE
  // ─────────────────────────────────────────────
  const heute = new Date()
  const vorDreiMonaten = new Date(heute)
  vorDreiMonaten.setMonth(heute.getMonth() - 3)
  const vorZweiMonaten = new Date(heute)
  vorZweiMonaten.setMonth(heute.getMonth() - 2)
  const vorEinemMonat = new Date(heute)
  vorEinemMonat.setMonth(heute.getMonth() - 1)

  const vertrag1 = await prisma.rentalContract.upsert({
    where: { id: 'vertrag-01' },
    update: {},
    create: {
      id: 'vertrag-01',
      organizationId: org.id,
      customerId: kundeKoch.id,
      instrumentId: altSax01.id,
      startDate: vorDreiMonaten,
      monthlyRent: 28.00,
      depositAmount: 80.00,
      depositReceivedAt: vorDreiMonaten,
      paymentMethod: PaymentMethod.DIRECT_DEBIT,
      paymentReference: `BK${formatDate(vorDreiMonaten)}AltSax01`,
      firstMonthCash: true,
      status: RentalContractStatus.ACTIVE,
    },
  })

  const vertrag2 = await prisma.rentalContract.upsert({
    where: { id: 'vertrag-02' },
    update: {},
    create: {
      id: 'vertrag-02',
      organizationId: org.id,
      customerId: kundeSchneider.id,
      instrumentId: altSax02.id,
      startDate: vorZweiMonaten,
      monthlyRent: 32.00,
      depositAmount: 100.00,
      depositReceivedAt: vorZweiMonaten,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentReference: `MS${formatDate(vorZweiMonaten)}AltSax02`,
      firstMonthCash: false,
      status: RentalContractStatus.ACTIVE,
    },
  })

  const vertrag3 = await prisma.rentalContract.upsert({
    where: { id: 'vertrag-03' },
    update: {},
    create: {
      id: 'vertrag-03',
      organizationId: org.id,
      customerId: kundeMueller.id,
      instrumentId: tenSax01.id,
      startDate: vorEinemMonat,
      monthlyRent: 34.00,
      depositAmount: 100.00,
      depositReceivedAt: vorEinemMonat,
      paymentMethod: PaymentMethod.DIRECT_DEBIT,
      paymentReference: `AM${formatDate(vorEinemMonat)}TenSax01`,
      firstMonthCash: true,
      status: RentalContractStatus.ACTIVE,
    },
  })
  console.log(`✓ 3 Mietverträge angelegt`)

  // ─────────────────────────────────────────────
  // ZAHLUNGEN
  // ─────────────────────────────────────────────

  // Vertrag 1 – Koch / AltSax01 (3 Monate)
  // Monat 1: bar (bezahlt), Monat 2+3: Abbuchung (bezahlt), aktueller Monat: offen
  await prisma.payment.upsert({
    where: { id: 'pay-01-01' },
    update: {},
    create: {
      id: 'pay-01-01',
      organizationId: org.id,
      rentalContractId: vertrag1.id,
      customerId: kundeKoch.id,
      instrumentId: altSax01.id,
      dueDate: vorDreiMonaten,
      amount: 28.00,
      method: PaymentMethod.CASH,
      status: PaymentStatus.PAID,
      paidAt: vorDreiMonaten,
      paymentReference: vertrag1.paymentReference,
    },
  })
  await prisma.payment.upsert({
    where: { id: 'pay-01-02' },
    update: {},
    create: {
      id: 'pay-01-02',
      organizationId: org.id,
      rentalContractId: vertrag1.id,
      customerId: kundeKoch.id,
      instrumentId: altSax01.id,
      dueDate: vorZweiMonaten,
      amount: 28.00,
      method: PaymentMethod.DIRECT_DEBIT,
      status: PaymentStatus.PAID,
      paidAt: vorZweiMonaten,
      paymentReference: vertrag1.paymentReference,
    },
  })
  await prisma.payment.upsert({
    where: { id: 'pay-01-03' },
    update: {},
    create: {
      id: 'pay-01-03',
      organizationId: org.id,
      rentalContractId: vertrag1.id,
      customerId: kundeKoch.id,
      instrumentId: altSax01.id,
      dueDate: vorEinemMonat,
      amount: 28.00,
      method: PaymentMethod.DIRECT_DEBIT,
      status: PaymentStatus.PAID,
      paidAt: vorEinemMonat,
      paymentReference: vertrag1.paymentReference,
    },
  })
  await prisma.payment.upsert({
    where: { id: 'pay-01-04' },
    update: {},
    create: {
      id: 'pay-01-04',
      organizationId: org.id,
      rentalContractId: vertrag1.id,
      customerId: kundeKoch.id,
      instrumentId: altSax01.id,
      dueDate: heute,
      amount: 28.00,
      method: PaymentMethod.DIRECT_DEBIT,
      status: PaymentStatus.OPEN,
      paymentReference: vertrag1.paymentReference,
    },
  })

  // Vertrag 2 – Schneider / AltSax02 (2 Monate)
  await prisma.payment.upsert({
    where: { id: 'pay-02-01' },
    update: {},
    create: {
      id: 'pay-02-01',
      organizationId: org.id,
      rentalContractId: vertrag2.id,
      customerId: kundeSchneider.id,
      instrumentId: altSax02.id,
      dueDate: vorZweiMonaten,
      amount: 32.00,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PAID,
      paidAt: vorZweiMonaten,
      paymentReference: vertrag2.paymentReference,
    },
  })
  await prisma.payment.upsert({
    where: { id: 'pay-02-02' },
    update: {},
    create: {
      id: 'pay-02-02',
      organizationId: org.id,
      rentalContractId: vertrag2.id,
      customerId: kundeSchneider.id,
      instrumentId: altSax02.id,
      dueDate: vorEinemMonat,
      amount: 32.00,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.OPEN,
      paymentReference: vertrag2.paymentReference,
    },
  })

  // Vertrag 3 – Müller / TenSax01 (1 Monat)
  await prisma.payment.upsert({
    where: { id: 'pay-03-01' },
    update: {},
    create: {
      id: 'pay-03-01',
      organizationId: org.id,
      rentalContractId: vertrag3.id,
      customerId: kundeMueller.id,
      instrumentId: tenSax01.id,
      dueDate: vorEinemMonat,
      amount: 34.00,
      method: PaymentMethod.CASH,
      status: PaymentStatus.OPEN,
      paymentReference: vertrag3.paymentReference,
    },
  })
  console.log(`✓ Zahlungen angelegt`)

  // ─────────────────────────────────────────────
  // STATUSHISTORIEN
  // ─────────────────────────────────────────────
  await prisma.instrumentStatusHistory.createMany({
    skipDuplicates: true,
    data: [
      {
        instrumentId: altSax01.id,
        oldStatus: null,
        newStatus: 'AVAILABLE',
        reason: 'Instrument neu angelegt',
        changedAt: new Date('2024-08-01'),
      },
      {
        instrumentId: altSax01.id,
        oldStatus: 'AVAILABLE',
        newStatus: 'RENTED',
        reason: 'Vermietet an Bernd Koch',
        changedAt: vorDreiMonaten,
      },
      {
        instrumentId: altSax02.id,
        oldStatus: null,
        newStatus: 'AVAILABLE',
        reason: 'Instrument neu angelegt',
        changedAt: new Date('2024-06-01'),
      },
      {
        instrumentId: altSax02.id,
        oldStatus: 'AVAILABLE',
        newStatus: 'RENTED',
        reason: 'Vermietet an Maria Schneider',
        changedAt: vorZweiMonaten,
      },
      {
        instrumentId: tenSax01.id,
        oldStatus: null,
        newStatus: 'AVAILABLE',
        reason: 'Instrument neu angelegt',
        changedAt: new Date('2024-05-15'),
      },
      {
        instrumentId: tenSax01.id,
        oldStatus: 'AVAILABLE',
        newStatus: 'RENTED',
        reason: 'Vermietet an Anna Müller',
        changedAt: vorEinemMonat,
      },
    ],
  })
  console.log(`✓ Statushistorien angelegt`)

  console.log('\n✅ Seed abgeschlossen!')
  console.log('\nIn der Datenbank solltest du jetzt sehen:')
  console.log('  - 1 Organisation: Musikwerkstatt Muster')
  console.log('  - 4 Kategorien: Altsaxophon, Tenorsaxophon, Klarinette, Querflöte')
  console.log('  - 4 Marken: Yamaha, Selmer, Buffet Crampon, Jupiter')
  console.log('  - 10 Instrumente mit verschiedenen Status')
  console.log('  - 5 Kunden')
  console.log('  - 3 aktive Mietverträge')
  console.log('  - 7 Zahlungen (4 bezahlt, 3 offen)')
  console.log('  - 6 Statushistorie-Einträge')
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${dd}${mm}${yy}`
}

main()
  .catch((e) => {
    console.error('❌ Seed-Fehler:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

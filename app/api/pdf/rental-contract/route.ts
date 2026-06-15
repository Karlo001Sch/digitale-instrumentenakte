import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contractId = searchParams.get('contractId')

  if (!contractId) {
    return NextResponse.json({ error: 'contractId fehlt' }, { status: 400 })
  }

  const rental = await prisma.rentalContract.findUnique({
    where: { id: contractId },
    include: {
      customer: true,
      instrument: {
        include: { category: true, brand: true },
      },
      organization: {
        include: { settings: true },
      },
    },
  })

  if (!rental) {
    return NextResponse.json({ error: 'Vertrag nicht gefunden' }, { status: 404 })
  }

  const data = {
    organization: { ...rental.organization, name: rental.organization.settings?.appName ?? rental.organization.name },
    primaryColor: rental.organization.settings?.primaryColor ?? '#2563eb',
    customer: rental.customer,
    instrument: {
      ...rental.instrument,
      currentValue: Number(rental.instrument.currentValue),
      defaultMonthlyRent: Number(rental.instrument.defaultMonthlyRent),
      defaultDeposit: Number(rental.instrument.defaultDeposit),
      purchasePrice: Number(rental.instrument.purchasePrice),
    },
    rental: {
      ...rental,
      monthlyRent: Number(rental.monthlyRent),
      depositAmount: Number(rental.depositAmount),
    },
  }

  try {
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')
    const { createElement } = await import('react')

    const styles = StyleSheet.create({
      page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#1a1a1a' },
      header: { marginBottom: 24, borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 12 },
      orgName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#2563eb', marginBottom: 4 },
      orgSub: { fontSize: 9, color: '#6b7280' },
      title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 20, marginTop: 8 },
      section: { marginBottom: 16 },
      sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#6b7280', marginBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', paddingBottom: 3 },
      row: { flexDirection: 'row', marginBottom: 4 },
      label: { width: 140, color: '#6b7280' },
      value: { flex: 1, fontFamily: 'Helvetica-Bold' },
      referenceBox: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 4, padding: 10, marginBottom: 16 },
      referenceLabel: { fontSize: 8, color: '#6b7280', marginBottom: 3 },
      referenceValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1d4ed8', letterSpacing: 1 },
      signatureSection: { marginTop: 32, flexDirection: 'row', gap: 40 },
      signatureBox: { flex: 1 },
      signatureLine: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a', marginBottom: 4, height: 40 },
      signatureLabel: { fontSize: 8, color: '#6b7280' },
      footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
      footerText: { fontSize: 8, color: '#9ca3af' },
      noteBox: { backgroundColor: '#f9fafb', borderWidth: 0.5, borderColor: '#e5e7eb', borderRadius: 4, padding: 8, marginBottom: 16 },
      noteText: { fontSize: 9, color: '#374151', lineHeight: 1.5 },
    })

    const PAYMENT_LABELS: Record<string, string> = {
      CASH: 'Barzahlung', BANK_TRANSFER: 'Überweisung',
      DIRECT_DEBIT: 'Lastschrift (Abbuchung)', CARD: 'EC-Karte', UNKNOWN: 'Unbekannt',
    }

    const fmt = (d: Date | string) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const c = createElement
    const { customer: cu, instrument: ins, rental: r, organization: org, primaryColor } = data

    const doc = c(Document, null,
      c(Page, { size: 'A4', style: styles.page },
        c(View, { style: styles.header },
          c(Text, { style: styles.orgName }, org.name),
          c(Text, { style: styles.orgSub }, 'Mietvertrag für Musikinstrumente')
        ),
        c(Text, { style: styles.title }, 'Mietvertrag'),
        c(View, { style: styles.referenceBox },
          c(Text, { style: styles.referenceLabel }, 'Verwendungszweck / Identnummer'),
          c(Text, { style: styles.referenceValue }, r.paymentReference)
        ),
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Mieter'),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Name'), c(Text, { style: styles.value }, `${cu.firstName} ${cu.lastName}`)),
          cu.street ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Adresse'), c(Text, { style: styles.value }, `${cu.street}\n${cu.postalCode} ${cu.city}`)) : null,
          cu.phone ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Telefon'), c(Text, { style: styles.value }, cu.phone)) : null,
          cu.email ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'E-Mail'), c(Text, { style: styles.value }, cu.email)) : null,
        ),
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Instrument'),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Kennung'), c(Text, { style: styles.value }, ins.internalId)),
          ins.label ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Bezeichnung'), c(Text, { style: styles.value }, ins.label)) : null,
          ins.category ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Art'), c(Text, { style: styles.value }, ins.category.name)) : null,
          ins.brand ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Marke'), c(Text, { style: styles.value }, ins.brand.name)) : null,
          ins.serialNumber ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Seriennummer'), c(Text, { style: styles.value }, ins.serialNumber)) : null,
        ),
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Mietkonditionen'),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Mietbeginn'), c(Text, { style: styles.value }, fmt(r.startDate))),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Monatsmiete'), c(Text, { style: styles.value }, `${r.monthlyRent.toFixed(2)} € / Monat`)),
          r.depositAmount > 0 ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Kaution'), c(Text, { style: styles.value }, `${r.depositAmount.toFixed(2)} €`)) : null,
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Zahlungsart'), c(Text, { style: styles.value }, PAYMENT_LABELS[r.paymentMethod])),
          r.firstMonthCash ? c(View, { style: styles.row }, c(Text, { style: styles.label }, '1. Monat'), c(Text, { style: styles.value }, 'Barzahlung')) : null,
        ),
        c(View, { style: styles.noteBox },
          c(Text, { style: styles.noteText },
            'Hinweise zur Rückgabe:\n• Das Instrument ist im Übergabezustand zurückzugeben.\n• Schäden über normale Abnutzung sind zu ersetzen.\n• Die Kaution wird nach erfolgreicher Rückgabe zurückerstattet.'
          )
        ),
        r.notes ? c(View, { style: styles.noteBox }, c(Text, { style: styles.noteText }, `Besondere Vereinbarungen: ${r.notes}`)) : null,
        c(View, { style: styles.signatureSection },
          c(View, { style: styles.signatureBox }, c(View, { style: styles.signatureLine }), c(Text, { style: styles.signatureLabel }, 'Datum, Unterschrift Vermieter')),
          c(View, { style: styles.signatureBox }, c(View, { style: styles.signatureLine }), c(Text, { style: styles.signatureLabel }, 'Datum, Unterschrift Mieter')),
        ),
        c(View, { style: styles.footer },
          c(Text, { style: styles.footerText }, org.name),
          c(Text, { style: styles.footerText }, `Erstellt am ${new Date().toLocaleDateString('de-DE')}`)
        )
      )
    )

    const buffer = await renderToBuffer(doc)
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Mietvertrag-${rental.paymentReference}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF error:', error)
    return NextResponse.json({ error: 'PDF-Erstellung fehlgeschlagen' }, { status: 500 })
  }
}

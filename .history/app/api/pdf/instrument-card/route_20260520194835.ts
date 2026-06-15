import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const instrumentId = searchParams.get('instrumentId')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`

  if (!instrumentId) {
    return NextResponse.json({ error: 'instrumentId fehlt' }, { status: 400 })
  }

  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
    include: {
      category: true,
      brand: true,
      organization: {
        include: { settings: true },
      },
      rentals: {
        where: { status: 'ACTIVE' },
        include: { customer: true },
        take: 1,
      },
      payments: {
        where: { status: 'OPEN' },
        orderBy: { dueDate: 'asc' },
        take: 5,
      },
    },
  })

  if (!instrument) {
    return NextResponse.json({ error: 'Instrument nicht gefunden' }, { status: 404 })
  }

  // Letzte 5 Mietverträge für Historie
  const rentalHistory = await prisma.rentalContract.findMany({
    where: { instrumentId },
    include: { customer: true },
    orderBy: { startDate: 'desc' },
    take: 5,
  })

  // QR-Code als Data URL generieren
  const instrumentUrl = `${baseUrl}/instruments/${instrumentId}`
  const qrDataUrl = await QRCode.toDataURL(instrumentUrl, {
    width: 120,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  })
  // Base64 Teil extrahieren
  const qrBase64 = qrDataUrl.split(',')[1]

  const activeRental = instrument.rentals[0]
  const primaryColor = instrument.organization.settings?.primaryColor ?? '#2563eb'

  const PAYMENT_LABELS: Record<string, string> = {
    CASH: 'Bar', BANK_TRANSFER: 'Überweisung',
    DIRECT_DEBIT: 'Abbuchung', CARD: 'EC-Karte', UNKNOWN: 'Unbekannt',
  }
  const STATUS_LABELS: Record<string, string> = {
    AVAILABLE: 'Vermietfähig', RENTED: 'Vermietet', IN_REPAIR: 'In Reparatur',
    AWAY_OR_MISSING: 'Nicht vorhanden', OVERHAUL_EXTERNAL: 'Generalüberholung',
    RESERVED: 'Reserviert', SOLD: 'Verkauft', RETIRED: 'Ausgemustert',
  }

  const fmt = (d: Date | string) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  try {
    const { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer')
    const { createElement: c } = await import('react')

    const styles = StyleSheet.create({
      page: { fontFamily: 'Helvetica', fontSize: 9, padding: 20, color: '#1a1a1a', backgroundColor: '#ffffff' },
      header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, borderBottomWidth: 1.5, borderBottomColor: primaryColor, paddingBottom: 8 },
      headerLeft: { flex: 1 },
      internalId: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: primaryColor, letterSpacing: 1 },
      label: { fontSize: 10, color: '#374151', marginTop: 2 },
      statusBadge: { marginTop: 4, backgroundColor: primaryColor + '20', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
      statusText: { fontSize: 8, color: primaryColor, fontFamily: 'Helvetica-Bold' },
      qrCode: { width: 70, height: 70 },
      section: { marginBottom: 8 },
      sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
      row: { flexDirection: 'row', marginBottom: 2 },
      rowLabel: { width: 100, color: '#6b7280', fontSize: 8 },
      rowValue: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 8 },
      divider: { borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', marginVertical: 6 },
      rentalBox: { backgroundColor: '#eff6ff', borderWidth: 0.5, borderColor: primaryColor + '40', borderRadius: 3, padding: 6, marginBottom: 8 },
      rentalTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: primaryColor, marginBottom: 4 },
      historyRow: { flexDirection: 'row', marginBottom: 2, fontSize: 7.5 },
      historyName: { flex: 1, color: '#374151' },
      historyDate: { color: '#9ca3af', width: 70 },
      footer: { position: 'absolute', bottom: 15, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 4 },
      footerText: { fontSize: 7, color: '#9ca3af' },
    })

    const effectiveStatus = activeRental ? 'RENTED' : instrument.status

    const doc = c(Document, null,
      c(Page, { size: 'A5', style: styles.page },
        // Header mit ID und QR-Code
        c(View, { style: styles.header },
          c(View, { style: styles.headerLeft },
            c(Text, { style: styles.internalId }, instrument.internalId),
            instrument.label ? c(Text, { style: styles.label }, instrument.label) : null,
            c(View, { style: styles.statusBadge },
              c(Text, { style: styles.statusText }, STATUS_LABELS[effectiveStatus] ?? effectiveStatus)
            ),
          ),
          c(Image, { style: styles.qrCode, src: `data:image/png;base64,${qrBase64}` })
        ),

        // Stammdaten
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Instrument'),
          instrument.category ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Art'), c(Text, { style: styles.rowValue }, instrument.category.name)) : null,
          instrument.brand ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Marke'), c(Text, { style: styles.rowValue }, instrument.brand.name)) : null,
          instrument.model ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Modell'), c(Text, { style: styles.rowValue }, instrument.model)) : null,
          instrument.serialNumber ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Seriennummer'), c(Text, { style: styles.rowValue }, instrument.serialNumber)) : null,
          instrument.currentValue ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Zeitwert'), c(Text, { style: styles.rowValue }, `${Number(instrument.currentValue).toFixed(2)} €`)) : null,
          instrument.location ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Standort'), c(Text, { style: styles.rowValue }, instrument.location)) : null,
        ),

        c(View, { style: styles.divider }),

        // Mietkonditionen
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Mietkonditionen'),
          instrument.defaultMonthlyRent ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Monatsmiete'), c(Text, { style: styles.rowValue }, `${Number(instrument.defaultMonthlyRent).toFixed(2)} €`)) : null,
          instrument.defaultDeposit ? c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Kaution'), c(Text, { style: styles.rowValue }, `${Number(instrument.defaultDeposit).toFixed(2)} €`)) : null,
        ),

        c(View, { style: styles.divider }),

        // Aktuelle Vermietung
        activeRental ? c(View, { style: styles.rentalBox },
          c(Text, { style: styles.rentalTitle }, 'Aktuelle Vermietung'),
          c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Mieter'), c(Text, { style: styles.rowValue }, `${activeRental.customer.firstName} ${activeRental.customer.lastName}`)),
          c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Seit'), c(Text, { style: styles.rowValue }, fmt(activeRental.startDate))),
          c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Miete'), c(Text, { style: styles.rowValue }, `${Number(activeRental.monthlyRent).toFixed(2)} €`)),
          c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Zahlungsart'), c(Text, { style: styles.rowValue }, PAYMENT_LABELS[activeRental.paymentMethod])),
          c(View, { style: styles.row }, c(Text, { style: styles.rowLabel }, 'Verwendungszweck'), c(Text, { style: styles.rowValue }, activeRental.paymentReference)),
        ) : null,

        // Mieterhistorie
        rentalHistory.length > 0 ? c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Mieterhistorie'),
          ...rentalHistory.map((r) =>
            c(View, { style: styles.historyRow },
              c(Text, { style: styles.historyName }, `${r.customer.firstName} ${r.customer.lastName}`),
              c(Text, { style: styles.historyDate }, `${fmt(r.startDate)}${r.endDate ? ` – ${fmt(r.endDate)}` : ' (aktiv)'}`)
            )
          )
        ) : null,

        // Notizen
        instrument.generalNotes ? c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Notizen'),
          c(Text, { style: { fontSize: 8, color: '#374151' } }, instrument.generalNotes)
        ) : null,

        // Footer
        c(View, { style: styles.footer },
          c(Text, { style: styles.footerText }, instrument.organization.settings?.appName ?? instrument.organization.name),
          c(Text, { style: styles.footerText }, `Stand: ${new Date().toLocaleDateString('de-DE')}`)
        )
      )
    )

    const buffer = await renderToBuffer(doc)
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Karteikarte-${instrument.internalId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF error:', error)
    return NextResponse.json({ error: 'PDF-Erstellung fehlgeschlagen' }, { status: 500 })
  }
}

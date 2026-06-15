import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// type: 'receipt' | 'return' | 'settlement'
// receipt = Kautionsquittung (Eingang)
// return = Empfangsbestätigung (Rückgabe)
// settlement = Verrechnungsrechnung (mit MwSt)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rentalId = searchParams.get('rentalId')
  const type = searchParams.get('type') as 'receipt' | 'return' | 'settlement'

  if (!rentalId || !type) {
    return NextResponse.json({ error: 'Parameter fehlen' }, { status: 400 })
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const rental = await prisma.rentalContract.findUnique({
    where: { id: rentalId },
    include: {
      customer: true,
      instrument: { include: { category: true, brand: true } },
      organization: { include: { settings: true } },
    },
  })

  if (!rental) return NextResponse.json({ error: 'Vertrag nicht gefunden' }, { status: 404 })

  const orgName = rental.organization.settings?.appName ?? rental.organization.name
  const primaryColor = rental.organization.settings?.primaryColor ?? '#2563eb'
  const depositAmount = Number(rental.depositAmount ?? 0)
  const netAmount = Math.round(depositAmount / 1.19 * 100) / 100 // Netto bei 19% MwSt
  const vatAmount = Math.round((depositAmount - netAmount) * 100) / 100

  const fmt = (d: Date | string | null) => d
    ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '–'

  const titles = {
    receipt: 'Kautionsquittung',
    return: 'Empfangsbestätigung – Kautionsrückgabe',
    settlement: 'Rechnung – Kautionsverrechnung',
  }

  // Einfache Rechnungsnummer
  const invoiceNumber = `KAU-${rental.id.slice(-6).toUpperCase()}-${type === 'settlement' ? 'R' : type === 'return' ? 'B' : 'Q'}`

  try {
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')
    const { createElement: c } = await import('react')

    const styles = StyleSheet.create({
      page: { fontFamily: 'Helvetica', fontSize: 10, padding: 50, color: '#1a1a1a' },
      header: { marginBottom: 24, borderBottomWidth: 2, borderBottomColor: primaryColor, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
      orgName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: primaryColor },
      docNumber: { fontSize: 9, color: '#6b7280' },
      title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 20, color: '#1a1a1a' },
      subtitle: { fontSize: 9, color: '#6b7280', marginBottom: 20 },
      section: { marginBottom: 16 },
      sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', paddingBottom: 3 },
      row: { flexDirection: 'row', marginBottom: 4 },
      label: { width: 160, color: '#6b7280' },
      value: { flex: 1, fontFamily: 'Helvetica-Bold' },
      amountBox: { backgroundColor: primaryColor + '10', borderWidth: 1, borderColor: primaryColor + '40', borderRadius: 4, padding: 12, marginBottom: 20 },
      amountLabel: { fontSize: 9, color: '#6b7280', marginBottom: 4 },
      amountValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: primaryColor },
      vatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, fontSize: 9 },
      vatLabel: { color: '#6b7280' },
      vatValue: { fontFamily: 'Helvetica-Bold' },
      divider: { borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', marginVertical: 8 },
      bodyText: { fontSize: 9.5, lineHeight: 1.6, color: '#374151', marginBottom: 10 },
      signatureSection: { marginTop: 32, flexDirection: 'row', gap: 40 },
      signatureBox: { flex: 1 },
      signatureLine: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a', marginBottom: 4, height: 40 },
      signatureLabel: { fontSize: 8, color: '#6b7280' },
      footer: { position: 'absolute', bottom: 30, left: 50, right: 50, borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
      footerText: { fontSize: 8, color: '#9ca3af' },
      legalNote: { fontSize: 8, color: '#9ca3af', marginTop: 16, lineHeight: 1.5 },
    })

    const bodyTexts = {
      receipt: [
        `Hiermit bestätigen wir den Eingang der Mietkaution für das oben genannte Instrument.`,
        `Die Kaution wird für die Dauer des Mietverhältnisses verwahrt und nach ordnungsgemäßer Rückgabe des Instruments zurückerstattet, sofern keine Schäden oder ausstehende Zahlungen vorliegen.`,
      ],
      return: [
        `Hiermit bestätige ich, ${rental.customer.firstName} ${rental.customer.lastName}, den Erhalt der Mietkaution in oben genannter Höhe.`,
        `Die Kaution wurde vollständig und in bar/per Überweisung zurückerhalten. Damit sind alle gegenseitigen Ansprüche aus dem Mietverhältnis für dieses Instrument ausgeglichen.`,
      ],
      settlement: [
        `Die hinterlegte Mietkaution wird gemäß der getroffenen Vereinbarung mit offenen Forderungen verrechnet.`,
        `Der verrechnete Betrag stellt eine umsatzsteuerpflichtige Leistung dar und wird gemäß §14 UStG in Rechnung gestellt.`,
      ],
    }

    const sigLabels = {
      receipt: ['Datum, Unterschrift Vermieter (Quittung)', 'Datum, Unterschrift Mieter (Kenntnisnahme)'],
      return: ['Datum, Unterschrift Mieter (Empfangsbestätigung)', 'Datum, Unterschrift Vermieter'],
      settlement: ['Datum, Unterschrift Vermieter', 'Datum, Unterschrift Mieter'],
    }

    const doc = c(Document, null,
      c(Page, { size: 'A4', style: styles.page },
        // Header
        c(View, { style: styles.header },
          c(Text, { style: styles.orgName }, orgName),
          c(Text, { style: styles.docNumber }, `Nr: ${invoiceNumber}`)
        ),

        c(Text, { style: styles.title }, titles[type]),
        c(Text, { style: styles.subtitle }, `Ausgestellt am: ${fmt(new Date())}`),

        // Vertragsparteien
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Vertragsparteien'),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Vermieter'), c(Text, { style: styles.value }, orgName)),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Mieter'), c(Text, { style: styles.value }, `${rental.customer.firstName} ${rental.customer.lastName}`)),
          rental.customer.street ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Adresse'), c(Text, { style: styles.value }, `${rental.customer.street}, ${rental.customer.postalCode} ${rental.customer.city}`)) : null,
        ),

        // Instrument
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Instrument'),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Kennung'), c(Text, { style: styles.value }, rental.instrument.internalId)),
          rental.instrument.category ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Art'), c(Text, { style: styles.value }, rental.instrument.category.name)) : null,
          rental.instrument.brand ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Marke'), c(Text, { style: styles.value }, rental.instrument.brand.name)) : null,
          rental.instrument.serialNumber ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Seriennummer'), c(Text, { style: styles.value }, rental.instrument.serialNumber)) : null,
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Mietbeginn'), c(Text, { style: styles.value }, fmt(rental.startDate))),
          rental.endDate ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Mietende'), c(Text, { style: styles.value }, fmt(rental.endDate))) : null,
        ),

        // Kautionsbetrag
        c(View, { style: styles.amountBox },
          c(Text, { style: styles.amountLabel },
            type === 'receipt' ? 'Erhaltene Kautionssumme' :
            type === 'return' ? 'Zurückerhaltene Kautionssumme' :
            'Verrechnete Kautionssumme (Brutto)'
          ),
          c(Text, { style: styles.amountValue }, `${depositAmount.toFixed(2)} €`),
        ),

        // MwSt Aufschlüsselung nur bei Verrechnung
        type === 'settlement' ? c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Steueraufschlüsselung'),
          c(View, { style: styles.vatRow }, c(Text, { style: styles.vatLabel }, 'Nettobetrag'), c(Text, { style: styles.vatValue }, `${netAmount.toFixed(2)} €`)),
          c(View, { style: styles.vatRow }, c(Text, { style: styles.vatLabel }, 'Umsatzsteuer 19%'), c(Text, { style: styles.vatValue }, `${vatAmount.toFixed(2)} €`)),
          c(View, { style: styles.divider }),
          c(View, { style: styles.vatRow }, c(Text, { style: { ...styles.vatLabel, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' } }, 'Gesamtbetrag'), c(Text, { style: { ...styles.vatValue, fontSize: 11 } }, `${depositAmount.toFixed(2)} €`)),
        ) : null,

        // Fließtext
        ...bodyTexts[type].map((text) =>
          c(Text, { style: styles.bodyText }, text)
        ),

        // MwSt Hinweis
        type === 'settlement' ? c(Text, { style: styles.legalNote },
          'Hinweis: Diese Rechnung enthält Umsatzsteuer gemäß §14 UStG. Bitte prüfen Sie mit Ihrem Steuerberater, ob die Kleinunternehmerregelung (§19 UStG) für Sie gilt.'
        ) : null,

        // Unterschriften
        c(View, { style: styles.signatureSection },
          c(View, { style: styles.signatureBox },
            c(View, { style: styles.signatureLine }),
            c(Text, { style: styles.signatureLabel }, sigLabels[type][0])
          ),
          c(View, { style: styles.signatureBox },
            c(View, { style: styles.signatureLine }),
            c(Text, { style: styles.signatureLabel }, sigLabels[type][1])
          ),
        ),

        // Footer
        c(View, { style: styles.footer },
          c(Text, { style: styles.footerText }, orgName),
          c(Text, { style: styles.footerText }, `Dokument-Nr: ${invoiceNumber}`)
        )
      )
    )

    const buffer = await renderToBuffer(doc)
    const uint8Array = new Uint8Array(buffer)

    const fileNames = {
      receipt: `Kautionsquittung-${rental.instrument.internalId}`,
      return: `Kautionsrueckgabe-${rental.instrument.internalId}`,
      settlement: `Kautionsrechnung-${rental.instrument.internalId}`,
    }

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileNames[type]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF error:', error)
    return NextResponse.json({ error: 'PDF-Erstellung fehlgeschlagen' }, { status: 500 })
  }
}

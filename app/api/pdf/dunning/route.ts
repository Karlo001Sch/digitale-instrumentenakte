import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')
  const level = parseInt(searchParams.get('level') ?? '1')

  if (!paymentId) return NextResponse.json({ error: 'paymentId fehlt' }, { status: 400 })

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      customer: true,
      instrument: { include: { category: true } },
      rentalContract: true,
      organization: { include: { settings: true } },
    },
  })

  if (!payment) return NextResponse.json({ error: 'Zahlung nicht gefunden' }, { status: 404 })

  const orgName = payment.organization.settings?.appName ?? payment.organization.name
  const primaryColor = payment.organization.settings?.primaryColor ?? '#2563eb'
  const fee = level >= 2 ? 5.00 : 0
  const totalAmount = Number(payment.amount) + fee

  const fmt = (d: Date | string) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  try {
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')
    const { createElement: c } = await import('react')

    const styles = StyleSheet.create({
      page: { fontFamily: 'Helvetica', fontSize: 10, padding: 50, color: '#1a1a1a' },
      header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: primaryColor, paddingBottom: 10 },
      orgName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: primaryColor },
      title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 24 },
      levelBadge: { fontSize: 9, color: level >= 2 ? '#dc2626' : '#d97706', fontFamily: 'Helvetica-Bold', marginBottom: 16 },
      section: { marginBottom: 16 },
      sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
      row: { flexDirection: 'row', marginBottom: 4 },
      label: { width: 150, color: '#6b7280' },
      value: { flex: 1, fontFamily: 'Helvetica-Bold' },
      totalBox: { backgroundColor: level >= 2 ? '#fef2f2' : '#fffbeb', borderWidth: 1, borderColor: level >= 2 ? '#fca5a5' : '#fde68a', borderRadius: 4, padding: 12, marginBottom: 20 },
      totalLabel: { fontSize: 9, color: '#6b7280', marginBottom: 4 },
      totalAmount: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: level >= 2 ? '#dc2626' : '#d97706' },
      bodyText: { fontSize: 10, lineHeight: 1.6, color: '#374151', marginBottom: 12 },
      signatureSection: { marginTop: 40, flexDirection: 'row', gap: 40 },
      signatureBox: { flex: 1 },
      signatureLine: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a', marginBottom: 4, height: 36 },
      signatureLabel: { fontSize: 8, color: '#6b7280' },
      footer: { position: 'absolute', bottom: 30, left: 50, right: 50, borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
      footerText: { fontSize: 8, color: '#9ca3af' },
    })

    const levelText = level === 1 ? '1. Mahnung' : `2. Mahnung`
    const greeting = `Sehr geehrte/r ${payment.customer.firstName} ${payment.customer.lastName},`

    const body1 = level === 1
      ? `trotz unserer freundlichen Erinnerung haben wir leider noch keinen Zahlungseingang für den unten aufgeführten Betrag feststellen können. Wir bitten Sie, diesen umgehend zu begleichen.`
      : `wir haben Ihnen bereits eine Mahnung für den unten stehenden Betrag zukommen lassen. Da wir bis heute keinen Zahlungseingang verbuchen konnten, sehen wir uns gezwungen, Ihnen diese 2. Mahnung zu senden. Auf den ausstehenden Betrag werden Mahngebühren in Höhe von 5,00 € erhoben.`

    const body2 = `Bitte überweisen Sie den Gesamtbetrag von ${totalAmount.toFixed(2)} € bis spätestens ${fmt(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))} unter Angabe des Verwendungszwecks.`

    const doc = c(Document, null,
      c(Page, { size: 'A4', style: styles.page },
        c(View, { style: styles.header },
          c(Text, { style: styles.orgName }, orgName)
        ),

        // Empfänger
        c(View, { style: styles.section },
          c(Text, { style: { fontSize: 10, color: '#374151', lineHeight: 1.5 } },
            `${payment.customer.firstName} ${payment.customer.lastName}\n` +
            (payment.customer.street ? `${payment.customer.street}\n` : '') +
            (payment.customer.postalCode && payment.customer.city ? `${payment.customer.postalCode} ${payment.customer.city}` : '')
          )
        ),

        c(Text, { style: { fontSize: 9, color: '#9ca3af', marginBottom: 4 } }, fmt(new Date())),
        c(Text, { style: styles.title }, levelText),
        c(Text, { style: styles.levelBadge }, level >= 2 ? '⚠ Letzte Mahnung vor weiteren Schritten' : 'Bitte beachten Sie diese Mahnung'),

        // Zahlungsdetails
        c(View, { style: styles.section },
          c(Text, { style: styles.sectionTitle }, 'Offene Zahlung'),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Instrument'), c(Text, { style: styles.value }, `${payment.instrument.internalId}${payment.instrument.label ? ` – ${payment.instrument.label}` : ''}`)),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Fälligkeitsdatum'), c(Text, { style: styles.value }, fmt(payment.dueDate))),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Verwendungszweck'), c(Text, { style: styles.value }, payment.paymentReference ?? '–')),
          c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Offener Betrag'), c(Text, { style: styles.value }, `${Number(payment.amount).toFixed(2)} €`)),
          fee > 0 ? c(View, { style: styles.row }, c(Text, { style: styles.label }, 'Mahngebühr'), c(Text, { style: styles.value }, `${fee.toFixed(2)} €`)) : null,
        ),

        // Gesamtbetrag
        c(View, { style: styles.totalBox },
          c(Text, { style: styles.totalLabel }, 'Zu zahlender Gesamtbetrag'),
          c(Text, { style: styles.totalAmount }, `${totalAmount.toFixed(2)} €`)
        ),

        // Anschreiben
        c(Text, { style: styles.bodyText }, greeting),
        c(Text, { style: styles.bodyText }, body1),
        c(Text, { style: styles.bodyText }, body2),
        c(Text, { style: styles.bodyText }, 'Bei Fragen stehen wir Ihnen gerne zur Verfügung.'),
        c(Text, { style: styles.bodyText }, `Mit freundlichen Grüßen\n${orgName}`),

        // Unterschrift
        c(View, { style: styles.signatureSection },
          c(View, { style: styles.signatureBox },
            c(View, { style: styles.signatureLine }),
            c(Text, { style: styles.signatureLabel }, 'Datum, Unterschrift')
          ),
          c(View, { style: styles.signatureBox })
        ),

        // Footer
        c(View, { style: styles.footer },
          c(Text, { style: styles.footerText }, orgName),
          c(Text, { style: styles.footerText }, `Erstellt am ${fmt(new Date())}`)
        )
      )
    )

    const buffer = await renderToBuffer(doc)
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Mahnung-${level}-${payment.customer.lastName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF error:', error)
    return NextResponse.json({ error: 'PDF-Erstellung fehlgeschlagen' }, { status: 500 })
  }
}

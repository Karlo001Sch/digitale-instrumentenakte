import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 12,
  },
  orgName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  orgSub: {
    fontSize: 9,
    color: '#6b7280',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 140,
    color: '#6b7280',
  },
  value: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  referenceBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  referenceLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
  },
  referenceValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    letterSpacing: 1,
  },
  signatureSection: {
    marginTop: 32,
    flexDirection: 'row',
    gap: 40,
  },
  signatureBox: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginBottom: 4,
    height: 40,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  noteBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },
})

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Barzahlung',
  BANK_TRANSFER: 'Überweisung',
  DIRECT_DEBIT: 'Lastschrift (Abbuchung)',
  CARD: 'EC-Karte',
  UNKNOWN: 'Unbekannt',
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface RentalContractPDFProps {
  data: {
    organization: { name: string }
    customer: {
      firstName: string
      lastName: string
      street?: string | null
      postalCode?: string | null
      city?: string | null
      phone?: string | null
      email?: string | null
    }
    instrument: {
      internalId: string
      label?: string | null
      serialNumber?: string | null
      currentValue: number
      category?: { name: string } | null
      brand?: { name: string } | null
    }
    rental: {
      startDate: Date | string
      monthlyRent: number
      depositAmount: number
      depositReceivedAt?: Date | string | null
      paymentMethod: string
      paymentReference: string
      firstMonthCash: boolean
      notes?: string | null
    }
  }
}

export function RentalContractPDF({ data }: RentalContractPDFProps) {
  const { organization, customer, instrument, rental } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.orgName}>{organization.name}</Text>
          <Text style={styles.orgSub}>Mietvertrag für Musikinstrumente</Text>
        </View>

        <Text style={styles.title}>Mietvertrag</Text>

        {/* Verwendungszweck */}
        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Verwendungszweck / Identnummer</Text>
          <Text style={styles.referenceValue}>{rental.paymentReference}</Text>
        </View>

        {/* Mieter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mieter</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{customer.firstName} {customer.lastName}</Text>
          </View>
          {customer.street && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>
                {customer.street}{'\n'}{customer.postalCode} {customer.city}
              </Text>
            </View>
          )}
          {customer.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefon</Text>
              <Text style={styles.value}>{customer.phone}</Text>
            </View>
          )}
          {customer.email && (
            <View style={styles.row}>
              <Text style={styles.label}>E-Mail</Text>
              <Text style={styles.value}>{customer.email}</Text>
            </View>
          )}
        </View>

        {/* Instrument */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instrument</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Kennung</Text>
            <Text style={styles.value}>{instrument.internalId}</Text>
          </View>
          {instrument.label && (
            <View style={styles.row}>
              <Text style={styles.label}>Bezeichnung</Text>
              <Text style={styles.value}>{instrument.label}</Text>
            </View>
          )}
          {instrument.category && (
            <View style={styles.row}>
              <Text style={styles.label}>Instrumentenart</Text>
              <Text style={styles.value}>{instrument.category.name}</Text>
            </View>
          )}
          {instrument.brand && (
            <View style={styles.row}>
              <Text style={styles.label}>Marke</Text>
              <Text style={styles.value}>{instrument.brand.name}</Text>
            </View>
          )}
          {instrument.serialNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Seriennummer</Text>
              <Text style={styles.value}>{instrument.serialNumber}</Text>
            </View>
          )}
          {instrument.currentValue > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Zeitwert</Text>
              <Text style={styles.value}>{instrument.currentValue.toFixed(2)} €</Text>
            </View>
          )}
        </View>

        {/* Mietkonditionen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mietkonditionen</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mietbeginn</Text>
            <Text style={styles.value}>{formatDate(rental.startDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monatsmiete</Text>
            <Text style={styles.value}>{rental.monthlyRent.toFixed(2)} € / Monat</Text>
          </View>
          {rental.depositAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Kaution</Text>
              <Text style={styles.value}>
                {rental.depositAmount.toFixed(2)} €
                {rental.depositReceivedAt ? ` (erhalten am ${formatDate(rental.depositReceivedAt)})` : ''}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Zahlungsart</Text>
            <Text style={styles.value}>{PAYMENT_METHOD_LABELS[rental.paymentMethod]}</Text>
          </View>
          {rental.firstMonthCash && (
            <View style={styles.row}>
              <Text style={styles.label}>1. Monat</Text>
              <Text style={styles.value}>Barzahlung</Text>
            </View>
          )}
        </View>

        {/* Hinweise */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            {'Hinweise zur Rückgabe:\n'}
            {'• Das Instrument ist in dem bei Übergabe dokumentierten Zustand zurückzugeben.\n'}
            {'• Schäden, die über normale Abnutzung hinausgehen, sind zu ersetzen.\n'}
            {'• Die Kündigung des Mietverhältnisses ist jederzeit möglich.\n'}
            {'• Bei Rückgabe wird der Zustand des Instruments gemeinsam geprüft.\n'}
            {'• Die Kaution wird nach erfolgreicher Rückgabe zurückerstattet.'}
          </Text>
        </View>

        {rental.notes && (
          <View style={styles.noteBox}>
            <Text style={[styles.noteText, { color: '#6b7280' }]}>Besondere Vereinbarungen: {rental.notes}</Text>
          </View>
        )}

        {/* Unterschriften */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Datum, Unterschrift Vermieter</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Datum, Unterschrift Mieter</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{organization.name}</Text>
          <Text style={styles.footerText}>
            Erstellt am {new Date().toLocaleDateString('de-DE')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

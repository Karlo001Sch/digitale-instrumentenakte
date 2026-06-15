// Generiert die Bankkennung / Verwendungszweck
// Format: Initialen des Mieters + Datum TTMMJJ + internalId
// Beispiel: BK170526AltSax01

export function generatePaymentReference(
  firstName: string,
  lastName: string,
  date: Date,
  internalId: string
): string {
  // Initialen
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()

  // Datum TTMMJJ
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)

  // internalId bereinigen: Leerzeichen entfernen, Umlaute normalisieren
  const cleanId = internalId
    .replace(/\s+/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')

  return `${firstInitial}${lastInitial}${dd}${mm}${yy}${cleanId}`
}

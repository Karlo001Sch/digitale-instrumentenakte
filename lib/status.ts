export const INSTRUMENT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Vermietfähig',
  RENTED: 'Vermietet',
  IN_REPAIR: 'In Reparatur',
  AWAY_OR_MISSING: 'Nicht vorhanden / unterwegs',
  OVERHAUL_EXTERNAL: 'Zur Generalüberholung mitgegeben',
  RESERVED: 'Reserviert',
  SOLD: 'Verkauft',
  RETIRED: 'Ausgemustert',
}

export const INSTRUMENT_STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
> = {
  AVAILABLE: 'success',
  RENTED: 'default',
  IN_REPAIR: 'warning',
  AWAY_OR_MISSING: 'destructive',
  OVERHAUL_EXTERNAL: 'warning',
  RESERVED: 'info',
  SOLD: 'secondary',
  RETIRED: 'outline',
}

export function getStatusLabel(status: string): string {
  return INSTRUMENT_STATUS_LABELS[status] ?? status
}

export function getStatusVariant(status: string) {
  return INSTRUMENT_STATUS_VARIANTS[status] ?? 'secondary'
}

// Manuell wählbare Zielstatus (nicht RENTED – wird automatisch gesetzt)
export const CHANGEABLE_STATUSES = [
  { value: 'AVAILABLE', label: 'Vermietfähig' },
  { value: 'IN_REPAIR', label: 'In Reparatur' },
  { value: 'OVERHAUL_EXTERNAL', label: 'Zur Generalüberholung mitgegeben' },
  { value: 'AWAY_OR_MISSING', label: 'Nicht vorhanden / unterwegs' },
  { value: 'RESERVED', label: 'Reserviert' },
  { value: 'SOLD', label: 'Verkauft' },
  { value: 'RETIRED', label: 'Ausgemustert' },
]

// Erlaubte Zielstatus nach Mietvertragsende
export const RETURN_TARGET_STATUSES = [
  { value: 'AVAILABLE', label: 'Vermietfähig' },
  { value: 'IN_REPAIR', label: 'In Reparatur' },
  { value: 'OVERHAUL_EXTERNAL', label: 'Zur Generalüberholung mitgegeben' },
  { value: 'AWAY_OR_MISSING', label: 'Nicht vorhanden / unterwegs' },
]

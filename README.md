# Instrument Lifecycle Suite

Digitale Instrumentenverwaltung für Musikinstrumenten-Werkstätten.

---

## Voraussetzungen

- Node.js ≥ 18 → https://nodejs.org
- Ein Supabase-Konto (kostenlos) → https://supabase.com

---

## Lokaler Start – Schritt für Schritt

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Supabase-Projekt anlegen

1. Gehe zu https://supabase.com und erstelle ein neues Projekt
2. Region: **Frankfurt (eu-central-1)** empfohlen
3. Warte bis das Projekt bereit ist (~1 Minute)
4. Gehe zu **Project Settings → API**
5. Kopiere:
   - `Project URL`
   - `anon public` Key
   - `service_role` Key (nur serverseitig verwenden!)
6. Gehe zu **Project Settings → Database**
7. Kopiere die `Connection string` (URI-Format)

### 3. Umgebungsvariablen anlegen

```bash
cp .env.example .env.local
```

Dann `.env.local` mit deinen Supabase-Werten befüllen.

### 4. Datenbank einrichten

```bash
# Prisma Client generieren
npm run db:generate

# Schema in Supabase-Datenbank übertragen
npm run db:push

# Testdaten einspielen (nach Prompt 3)
npm run db:seed
```

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffne http://localhost:3000

---

## Projekt-Struktur

```
instrument-lifecycle-suite/
├── app/                    # Next.js App Router
│   ├── (auth)/login        # Login-Seite
│   ├── (dashboard)/        # Geschützter Bereich
│   │   ├── dashboard/      # Dashboard
│   │   ├── instruments/    # Instrumentenverwaltung
│   │   ├── customers/      # Kundenverwaltung
│   │   ├── rentals/        # Mietverträge
│   │   ├── payments/       # Zahlungen
│   │   └── settings/       # Einstellungen
│   └── api/                # API-Routen (PDF, Upload)
├── components/
│   ├── layout/             # Sidebar, Topbar
│   ├── ui/                 # shadcn/ui Basiskomponenten
│   ├── instruments/        # Instrumenten-Komponenten
│   ├── customers/          # Kunden-Komponenten
│   ├── rentals/            # Vertrags-Komponenten
│   └── payments/           # Zahlungs-Komponenten
├── lib/
│   ├── prisma.ts           # Datenbankverbindung
│   ├── supabase.ts         # Supabase Client
│   ├── auth.ts             # Auth-Helfer
│   ├── permissions.ts      # Rollen & Rechte
│   ├── status.ts           # Statuswerte & Labels
│   ├── validators.ts       # Zod-Schemas
│   └── utils.ts            # Hilfsfunktionen
└── prisma/
    └── schema.prisma       # Datenbankmodell
```

---

## Build-Reihenfolge (Prompts)

| Prompt | Inhalt |
|--------|--------|
| 1 | ✅ Projektstruktur (diese Datei) |
| 2 | Prisma Schema |
| 3 | Seed-Daten |
| 4 | Supabase Auth + Login |
| 5 | Rollen & Organisationen |
| 6 | Dashboard |
| 7 | Instrumentenliste |
| 8 | Instrument anlegen |
| 9 | Instrumentenakte |
| 10 | Instrument bearbeiten |
| 11 | Status ändern |
| 12 | Kunden |
| 13 | Kundendetailseite |
| 14 | Mietvertrag anlegen |
| 15 | Mietvertragsliste |
| 16 | Rückgabeprozess |
| 17 | Zahlungen |
| 18–30 | Notizen, Fotos, PDFs, CSV, Audit, ... |

---

## Technologie-Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Datenbank:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **PDF:** @react-pdf/renderer
- **Tabellen:** TanStack Table
- **Validierung:** Zod
- **CSV:** papaparse

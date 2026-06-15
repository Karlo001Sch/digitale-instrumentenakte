import { requireOrganization } from '@/lib/permissions'
import Link from 'next/link'
import { Tag, Building2, Users, ChevronRight, Palette } from 'lucide-react'

export default async function SettingsPage() {
  await requireOrganization()

  const items = [
    { href: '/settings/categories', icon: Tag, label: 'Kategorien', desc: 'Instrumentenkategorien verwalten' },
    { href: '/settings/brands', icon: Building2, label: 'Marken', desc: 'Instrumentenmarken verwalten' },
    { href: '/settings/users', icon: Users, label: 'Nutzerverwaltung', desc: 'Mitglieder und Rollen verwalten (nur Admin)' },
    { href: '/settings/design', icon: Palette, label: 'Design & Erscheinungsbild', desc: 'Logo, Farben und Programmname anpassen (nur Admin)' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">Organisationseinstellungen</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 bg-card border rounded-lg px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <item.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Music, Users, FileText,
  CreditCard, Settings, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Instrumente', href: '/instruments', icon: Music },
  { label: 'Kunden', href: '/customers', icon: Users },
  { label: 'Mietverträge', href: '/rentals', icon: FileText },
  { label: 'Zahlungen', href: '/payments', icon: CreditCard },
  { label: 'Einstellungen', href: '/settings', icon: Settings },
]

interface SidebarProps {
  appName?: string
  logoUrl?: string | null
}

export function Sidebar({ appName, logoUrl }: SidebarProps) {
  const pathname = usePathname()
  const displayName = appName ?? 'Instrument Lifecycle Suite'

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card flex flex-col">
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded" />
          ) : (
            <div className="bg-primary rounded-lg p-1.5">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-semibold text-sm leading-tight line-clamp-2">{displayName}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t">
        <p className="text-xs text-muted-foreground">Version 0.1.0</p>
      </div>
    </aside>
  )
}

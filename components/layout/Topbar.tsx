'use client'

import { LogOut, User, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

interface TopbarProps {
  organizationName: string
  userEmail: string
}

export function Topbar({ organizationName, userEmail }: TopbarProps) {
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="hidden sm:inline">{organizationName}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Abmelden</span>
        </button>
      </div>
    </header>
  )
}

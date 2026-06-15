'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Music } from 'lucide-react'

interface LoginFormProps {
  appName: string
  logoUrl?: string | null
  loginBgColor?: string
}

export function LoginForm({ appName, logoUrl, loginBgColor = '#f3f4f6' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-Mail oder Passwort ist falsch.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: loginBgColor }}>
      <div className="bg-card border rounded-lg p-8 w-full max-w-md shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded" />
          ) : (
            <div className="bg-primary rounded-lg p-2">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{appName}</p>
            <p className="text-xs text-muted-foreground">Instrumentenverwaltung</p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">Anmelden</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Bitte melde dich mit deinen Zugangsdaten an.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" htmlFor="email">E-Mail</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@werkstatt.de"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" htmlFor="password">Passwort</label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>
          )}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Zugangsdaten werden vom Administrator vergeben.
        </p>
      </div>
    </div>
  )
}

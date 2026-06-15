'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDesignSettings } from '@/components/settings/designActions'
import { Upload, X } from 'lucide-react'

interface DesignSettingsProps {
  organizationId: string
  orgName: string
  settings: {
    appName?: string | null
    primaryColor?: string | null
    loginBgColor?: string | null
    logoUrl?: string | null
  } | null
}

export function DesignSettings({ organizationId, orgName, settings }: DesignSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [appName, setAppName] = useState(settings?.appName ?? orgName)
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor ?? '#2563eb')
  const [loginBgColor, setLoginBgColor] = useState(settings?.loginBgColor ?? '#f3f4f6')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logoUrl ?? null)

  function handleLogoSelect(file: File) {
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append('organizationId', organizationId)
    formData.append('appName', appName)
    formData.append('primaryColor', primaryColor)
    formData.append('loginBgColor', loginBgColor)
    if (logoFile) formData.append('logo', logoFile)

    const result = await saveDesignSettings(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setLogoFile(null)
    router.refresh()

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Programmname */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Programmname</h2>
        <div>
          <label className="text-sm font-medium block mb-1.5">Name der Anwendung</label>
          <input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="z.B. Musikwerkstatt Muster"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Wird im Browser-Tab, in der Sidebar und im Login angezeigt.
          </p>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Logo</h2>
        <div className="flex items-start gap-4">
          {logoPreview ? (
            <div className="relative">
              <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded-lg border bg-muted" />
              <button
                onClick={() => { setLogoPreview(null); setLogoFile(null) }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-xs text-center">
              Kein Logo
            </div>
          )}
          <div className="flex-1">
            <label className="flex items-center gap-2 cursor-pointer h-10 px-4 border rounded-md text-sm hover:bg-accent transition-colors w-fit">
              <Upload className="h-4 w-4" />
              Logo hochladen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoSelect(f) }}
              />
            </label>
            <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG, SVG – empfohlen: quadratisch</p>
          </div>
        </div>
      </div>

      {/* Farben */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h2 className="font-medium text-sm">Farben</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Primärfarbe</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 rounded-md border border-input cursor-pointer"
              />
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#2563eb"
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Buttons, Links, aktive Elemente</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Login-Hintergrund</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={loginBgColor}
                onChange={(e) => setLoginBgColor(e.target.value)}
                className="h-10 w-16 rounded-md border border-input cursor-pointer"
              />
              <input
                value={loginBgColor}
                onChange={(e) => setLoginBgColor(e.target.value)}
                placeholder="#f3f4f6"
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hintergrundfarbe der Login-Seite</p>
          </div>
        </div>

        {/* Vorschau */}
        <div className="rounded-md overflow-hidden border">
          <div className="text-xs text-muted-foreground px-3 py-1.5 bg-muted border-b">Vorschau</div>
          <div className="p-4 flex gap-3 items-center" style={{ backgroundColor: loginBgColor }}>
            <button
              style={{ backgroundColor: primaryColor }}
              className="px-4 py-2 rounded-md text-white text-sm font-medium"
            >
              Anmelden
            </button>
            <span style={{ color: primaryColor }} className="text-sm font-medium underline cursor-pointer">
              {appName}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 text-sm rounded-md px-4 py-3">
          Einstellungen gespeichert. Seite neu laden um Änderungen zu sehen.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="h-10 px-6 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Wird gespeichert...' : 'Einstellungen speichern'}
      </button>
    </div>
  )
}

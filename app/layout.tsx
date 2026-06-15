import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { prisma } from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

import { getOrgSettings as getCachedSettings } from '@/lib/settings-cache'
async function getOrgSettings() {
  const { settings } = await getCachedSettings()
  return settings
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getOrgSettings()
  return {
    title: settings?.appName ?? 'Instrument Lifecycle Suite',
    description: 'Verwaltung von Mietinstrumenten',
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getOrgSettings()

  const primaryColor = settings?.primaryColor ?? '#2563eb'

  // Primärfarbe in HSL umrechnen für CSS-Variablen
  // Wir nutzen einen einfachen Hex→RGB Ansatz
  function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  const primaryHsl = primaryColor.startsWith('#') ? hexToHsl(primaryColor) : '221.2 83.2% 53.3%'

  return (
    <html lang="de">
      <head>
        <style>{`
          :root {
            --primary: ${primaryHsl};
            --primary-foreground: 210 40% 98%;
          }
        `}</style>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

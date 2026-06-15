'use client'

import { useState } from 'react'
import { createBrand, deleteBrand } from '@/components/settings/settingsActions'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'

interface Brand {
  id: string
  name: string
  _count: { instruments: number }
}

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.append('name', name)
    const result = await createBrand(fd)
    if (result?.error) { setError(result.error); setLoading(false); return }
    setName('')
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string, inUse: number) {
    if (inUse > 0) { alert(`Marke wird von ${inUse} Instrument(en) verwendet.`); return }
    if (!confirm('Marke wirklich löschen?')) return
    const result = await deleteBrand(id)
    if (result?.error) alert(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <h2 className="font-medium text-sm">Neue Marke</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Yamaha"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex items-center gap-1.5 h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Anlegen
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">Keine Marken vorhanden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instrumente</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{brand.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{brand._count.instruments}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(brand.id, brand._count.instruments)}
                      disabled={brand._count.instruments > 0}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={brand._count.instruments > 0 ? 'In Verwendung' : 'Löschen'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

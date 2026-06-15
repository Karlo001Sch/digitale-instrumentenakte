'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { importInstrumentsCsv } from '@/components/instruments/csvImportActions'

interface PreviewRow {
  internalId: string
  label: string
  category: string
  brand: string
  model: string
  serialNumber: string
  status: string
  currentValue: string
  defaultMonthlyRent: string
  defaultDeposit: string
  location: string
  generalNotes: string
  _isDuplicate?: boolean
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export function CsvImport({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(selectedFile: File) {
    setFile(selectedFile)
    setParseError(null)
    setResult(null)

    const text = await selectedFile.text()
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length < 2) {
      setParseError('CSV enthält keine Daten.')
      return
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
    const rows: PreviewRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
      rows.push({
        internalId: row.internalId ?? '',
        label: row.label ?? '',
        category: row.category ?? '',
        brand: row.brand ?? '',
        model: row.model ?? '',
        serialNumber: row.serialNumber ?? '',
        status: row.status ?? '',
        currentValue: row.currentValue ?? '',
        defaultMonthlyRent: row.defaultMonthlyRent ?? '',
        defaultDeposit: row.defaultDeposit ?? '',
        location: row.location ?? '',
        generalNotes: row.generalNotes ?? '',
      })
    }

    setPreview(rows)
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (line[i] === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += line[i]
      }
    }
    result.push(current.trim())
    return result
  }

  async function handleImport() {
    if (!preview.length) return
    setImporting(true)

    const formData = new FormData()
    formData.append('rows', JSON.stringify(preview))
    const importResult = await importInstrumentsCsv(formData)
    setResult(importResult)
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">CSV Import – Instrumente</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Ergebnis */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{result.imported} Instrumente importiert</span>
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{result.skipped} übersprungen (Duplikate)</span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3">
                  <p className="text-sm font-medium text-red-700 mb-1">{result.errors.length} Fehler:</p>
                  {result.errors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Fertig
              </button>
            </div>
          )}

          {!result && (
            <>
              {/* Dropzone */}
              {!file && (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">CSV-Datei hierher ziehen oder klicken</p>
                  </div>

                  <div className="mt-4 bg-muted/50 rounded-md p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Erwartete Spalten:</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      internalId, label, category, brand, model, serialNumber, status, currentValue, defaultMonthlyRent, defaultDeposit, location, generalNotes
                    </p>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-md px-4 py-3">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{parseError}</span>
                </div>
              )}

              {/* Vorschau */}
              {preview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{preview.length} Zeilen erkannt</p>
                    <button
                      onClick={() => { setFile(null); setPreview([]) }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Andere Datei wählen
                    </button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="text-left px-3 py-2 font-medium">ID</th>
                            <th className="text-left px-3 py-2 font-medium">Bezeichnung</th>
                            <th className="text-left px-3 py-2 font-medium">Kategorie</th>
                            <th className="text-left px-3 py-2 font-medium">Marke</th>
                            <th className="text-left px-3 py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {preview.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-3 py-1.5 font-mono">{row.internalId}</td>
                              <td className="px-3 py-1.5">{row.label}</td>
                              <td className="px-3 py-1.5">{row.category}</td>
                              <td className="px-3 py-1.5">{row.brand}</td>
                              <td className="px-3 py-1.5">{row.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {importing ? 'Wird importiert...' : `${preview.length} Instrumente importieren`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

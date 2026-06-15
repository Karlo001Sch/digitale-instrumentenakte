'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { addNote } from '@/components/instruments/noteActions'
import { Plus } from 'lucide-react'

const NOTE_TYPE_LABELS: Record<string, string> = {
  GENERAL: 'Allgemein',
  CONDITION: 'Zustand',
  RENTAL: 'Vermietung',
  REPAIR: 'Reparatur',
  CUSTOMER: 'Kunde',
  INTERNAL: 'Intern',
}

interface Note {
  id: string
  noteType: string
  content: string
  createdAt: Date
}

interface NoteSectionProps {
  instrumentId?: string
  customerId?: string
  notes: Note[]
}

export function NoteSection({ instrumentId, customerId, notes }: NoteSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('GENERAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localNotes, setLocalNotes] = useState(notes)

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Notiz darf nicht leer sein.')
      return
    }
    setLoading(true)
    setError(null)

    const result = await addNote({ instrumentId, customerId, noteType, content })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.note) {
      setLocalNotes([result.note as Note, ...localNotes])
    }

    setContent('')
    setNoteType('GENERAL')
    setShowForm(false)
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {localNotes.length} Notiz{localNotes.length !== 1 ? 'en' : ''}
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Neue Notiz
        </button>
      </div>

      {showForm && (
        <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Typ</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(NOTE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Notiz</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Notiz eingeben..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
            <button
              onClick={() => { setShowForm(false); setContent(''); setError(null) }}
              className="h-9 px-4 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {localNotes.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Keine Notizen vorhanden.</p>
      )}

      <div className="space-y-3">
        {localNotes.map((note) => (
          <div key={note.id} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">
                {NOTE_TYPE_LABELS[note.noteType] ?? note.noteType}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

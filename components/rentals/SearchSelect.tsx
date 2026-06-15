'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface Option {
  id: string
  label: string
  sublabel?: string
  meta?: string
}

interface SearchSelectProps {
  name: string
  placeholder: string
  options: Option[]
  value?: string
  onChange?: (id: string, option: Option | null) => void
  required?: boolean
}

export function SearchSelect({ name, placeholder, options, value, onChange, required }: SearchSelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.id === selectedId)

  const filtered = query.length >= 1
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
        o.meta?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : options.slice(0, 10)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(option: Option) {
    setSelectedId(option.id)
    setQuery('')
    setOpen(false)
    onChange?.(option.id, option)
  }

  function handleClear() {
    setSelectedId('')
    setQuery('')
    onChange?.('', null)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />

      {selected && !open ? (
        <div className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <span className="font-medium truncate">{selected.label}</span>
            {selected.sublabel && (
              <span className="text-muted-foreground ml-2 text-xs">{selected.sublabel}</span>
            )}
          </div>
          <button type="button" onClick={handleClear} className="ml-2 text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            required={required && !selectedId}
            className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Keine Ergebnisse{query ? ` für „${query}"` : ''}
            </div>
          ) : (
            filtered.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{option.label}</p>
                  {option.sublabel && (
                    <p className="text-xs text-muted-foreground truncate">{option.sublabel}</p>
                  )}
                </div>
                {option.meta && (
                  <span className="ml-2 text-xs text-muted-foreground flex-shrink-0">{option.meta}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

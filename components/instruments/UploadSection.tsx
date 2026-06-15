'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Image, FileText, X } from 'lucide-react'

interface UploadSectionProps {
  instrumentId: string
  type: 'photo' | 'document'
}

export function UploadSection({ instrumentId, type }: UploadSectionProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const isPhoto = type === 'photo'
  const accept = isPhoto ? 'image/*' : '.pdf,.doc,.docx,.txt,.xlsx,.csv'

  function handleFileSelect(file: File) {
    setSelectedFile(file)
    setError(null)
    if (!isPhoto) setTitle(file.name.replace(/\.[^/.]+$/, ''))
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('instrumentId', instrumentId)
    formData.append('type', type)
    if (caption) formData.append('caption', caption)
    if (title) formData.append('title', title)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Upload fehlgeschlagen')
        setUploading(false)
        return
      }

      setSelectedFile(null)
      setCaption('')
      setTitle('')
      router.refresh()
    } catch {
      setError('Upload fehlgeschlagen')
    }
    setUploading(false)
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFileSelect(file)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />
        <div className="flex flex-col items-center gap-2">
          {isPhoto
            ? <Image className="h-8 w-8 text-muted-foreground" />
            : <FileText className="h-8 w-8 text-muted-foreground" />}
          <p className="text-sm text-muted-foreground">
            {isPhoto ? 'Foto hierher ziehen oder klicken' : 'Dokument hierher ziehen oder klicken'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isPhoto ? 'JPG, PNG, WEBP' : 'PDF, Word, Excel, CSV'}
          </p>
        </div>
      </div>

      {/* Datei ausgewählt */}
      {selectedFile && (
        <div className="bg-muted/50 border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate max-w-48">{selectedFile.name}</span>
              <span className="text-muted-foreground text-xs">
                ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isPhoto && (
            <input
              type="text"
              placeholder="Beschriftung (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}

          {!isPhoto && (
            <input
              type="text"
              placeholder="Titel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Wird hochgeladen...' : `${isPhoto ? 'Foto' : 'Dokument'} hochladen`}
          </button>
        </div>
      )}
    </div>
  )
}

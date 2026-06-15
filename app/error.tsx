'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-semibold mb-2">Etwas ist schiefgelaufen</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-md">
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder kehre zum Dashboard zurück.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Erneut versuchen
        </button>
        <Link
          href="/dashboard"
          className="border px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
        >
          Zum Dashboard
        </Link>
      </div>
    </div>
  )
}

import { Music } from 'lucide-react'
import Link from 'next/link'

export default function NoOrganizationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="bg-card border rounded-lg p-8 w-full max-w-md shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-muted rounded-full p-4">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2">Kein Zugang</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Dein Konto ist keiner Organisation zugewiesen. Bitte wende dich an den Administrator.
        </p>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  )
}

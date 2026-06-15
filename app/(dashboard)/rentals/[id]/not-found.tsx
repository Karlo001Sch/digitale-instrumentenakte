import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function RentalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Mietvertrag nicht gefunden</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Der gesuchte Mietvertrag existiert nicht oder gehört nicht zu dieser Organisation.
      </p>
      <Link
        href="/rentals"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Alle Mietverträge anzeigen
      </Link>
    </div>
  )
}

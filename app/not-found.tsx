import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-xl font-semibold">Seite nicht gefunden</h2>
        <p className="text-muted-foreground text-sm">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Zum Dashboard
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import {
  Music,
  CheckCircle,
  FileText,
  Wrench,
  PackageX,
  AlertTriangle,
  CreditCard,
  Clock,
  Banknote,
} from 'lucide-react'

interface DashboardStatsProps {
  totalInstruments: number
  available: number
  rented: number
  inRepair: number
  overhaulExternal: number
  awayOrMissing: number
  openPayments: number
  overduePayments: number
  openCashPayments: number
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  href?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

function StatCard({ label, value, icon, href, variant = 'default' }: StatCardProps) {
  const variantClasses = {
    default: 'bg-card border',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    danger: 'bg-red-50 border border-red-200',
    info: 'bg-blue-50 border border-blue-200',
  }

  const iconClasses = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  }

  const valueClasses = {
    default: 'text-foreground',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
  }

  const content = (
    <div className={`rounded-lg p-4 ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={iconClasses[variant]}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueClasses[variant]}`}>{value}</p>
    </div>
  )

  if (href) {
    return <Link href={href} className="block hover:opacity-80 transition-opacity">{content}</Link>
  }

  return content
}

export function DashboardStats({
  totalInstruments,
  available,
  rented,
  inRepair,
  overhaulExternal,
  awayOrMissing,
  openPayments,
  overduePayments,
  openCashPayments,
}: DashboardStatsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Instrumente
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Gesamt"
          value={totalInstruments}
          icon={<Music className="h-4 w-4" />}
          href="/instruments"
        />
        <StatCard
          label="Vermietfähig"
          value={available}
          icon={<CheckCircle className="h-4 w-4" />}
          href="/instruments?status=AVAILABLE"
          variant="success"
        />
        <StatCard
          label="Vermietet"
          value={rented}
          icon={<FileText className="h-4 w-4" />}
          href="/instruments?status=RENTED"
          variant="info"
        />
        <StatCard
          label="In Reparatur"
          value={inRepair}
          icon={<Wrench className="h-4 w-4" />}
          href="/instruments?status=IN_REPAIR"
          variant="warning"
        />
        <StatCard
          label="Generalüberholung"
          value={overhaulExternal}
          icon={<PackageX className="h-4 w-4" />}
          href="/instruments?status=OVERHAUL_EXTERNAL"
          variant="warning"
        />
        <StatCard
          label="Nicht vorhanden"
          value={awayOrMissing}
          icon={<AlertTriangle className="h-4 w-4" />}
          href="/instruments?status=AWAY_OR_MISSING"
          variant="danger"
        />
      </div>

      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide pt-2">
        Zahlungen
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Offen"
          value={openPayments}
          icon={<CreditCard className="h-4 w-4" />}
          href="/payments"
          variant={openPayments > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Überfällig"
          value={overduePayments}
          icon={<Clock className="h-4 w-4" />}
          href="/payments?tab=overdue"
          variant={overduePayments > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Bar offen"
          value={openCashPayments}
          icon={<Banknote className="h-4 w-4" />}
          href="/payments?tab=cash"
          variant={openCashPayments > 0 ? 'warning' : 'default'}
        />
      </div>
    </div>
  )
}

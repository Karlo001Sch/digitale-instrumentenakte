'use client'

import { FileText } from 'lucide-react'

interface DepositButtonsProps {
  rentalId: string
  depositAmount: number
  depositReceivedAt: Date | null
  depositReturnedAt: Date | null
  depositNotes: string | null
  status: string
}

export function DepositButtons({
  rentalId,
  depositAmount,
  depositReceivedAt,
  depositReturnedAt,
  depositNotes,
  status,
}: DepositButtonsProps) {
  if (depositAmount <= 0) return null

  const isSettled = depositNotes?.toLowerCase().includes('verrechnet')
  const isReturned = !!depositReturnedAt
  const isActive = status === 'ACTIVE'
  const isEnded = status === 'ENDED'

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
      <p className="w-full text-xs font-medium text-muted-foreground mb-1">Kautionsdokumente</p>

      {/* Kautionsquittung – immer verfügbar wenn Kaution eingegangen */}
      {depositReceivedAt && (
        <a
          href={`/api/pdf/deposit?rentalId=${rentalId}&type=receipt`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs hover:bg-accent transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Kautionsquittung
        </a>
      )}

      {/* Empfangsbestätigung – wenn Kaution zurückgegeben */}
      {isEnded && isReturned && !isSettled && (
        <a
          href={`/api/pdf/deposit?rentalId=${rentalId}&type=return`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs hover:bg-accent transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Empfangsbestätigung (Rückgabe)
        </a>
      )}

      {/* Verechnungsrechnung – wenn Kaution verrechnet */}
      {isEnded && isSettled && (
        <a
          href={`/api/pdf/deposit?rentalId=${rentalId}&type=settlement`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-md text-xs text-orange-700 hover:bg-orange-100 transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Verrechnungsrechnung (mit MwSt)
        </a>
      )}

      {/* Hinweis wenn noch keine Aktion */}
      {isActive && !depositReceivedAt && (
        <p className="text-xs text-muted-foreground">Kaution noch nicht als eingegangen markiert.</p>
      )}
    </div>
  )
}

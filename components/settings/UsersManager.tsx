'use client'

import { useState } from 'react'
import { changeUserRole } from '@/components/settings/settingsActions'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator', STAFF: 'Mitarbeiter', VIEWER: 'Leser',
}

interface Member {
  id: string
  role: string
  userId: string
  user: { email: string; fullName: string | null }
}

export function UsersManager({ members, currentUserId }: { members: Member[], currentUserId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  async function handleRoleChange(memberId: string, newRole: string) {
    setLoadingId(memberId)
    await changeUserRole(memberId, newRole)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-Mail</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rolle</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 text-muted-foreground">{member.user.email}</td>
              <td className="px-4 py-3">{member.user.fullName ?? '–'}</td>
              <td className="px-4 py-3">
                {member.userId === currentUserId ? (
                  <Badge variant="default">{ROLE_LABELS[member.role]}</Badge>
                ) : (
                  <select
                    value={member.role}
                    disabled={loadingId === member.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="STAFF">Mitarbeiter</option>
                    <option value="VIEWER">Leser</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

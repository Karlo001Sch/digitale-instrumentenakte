'use server'

import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'

interface AddNoteInput {
  instrumentId?: string
  customerId?: string
  noteType: string
  content: string
}

export async function addNote({ instrumentId, customerId, noteType, content }: AddNoteInput) {
  const membership = await requireOrganization()
  const orgId = membership.organizationId
  const user = await getCurrentUser()

  if (!content.trim()) return { error: 'Notiz darf nicht leer sein.' }
  if (!instrumentId && !customerId) return { error: 'Kein Ziel angegeben.' }

  const note = await prisma.note.create({
    data: {
      organizationId: orgId,
      instrumentId: instrumentId ?? null,
      customerId: customerId ?? null,
      noteType: noteType as never,
      content: content.trim(),
      createdByUserId: user?.id,
    },
  })

  return { note }
}

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface AuditLogInput {
  organizationId: string
  userId?: string | null
  entityType: string
  entityId: string
  action: string
  oldData?: Prisma.InputJsonValue | null
  newData?: Prisma.InputJsonValue | null
}

export async function createAuditLog({
  organizationId,
  userId,
  entityType,
  entityId,
  action,
  oldData,
  newData,
}: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: userId ?? null,
        entityType,
        entityId,
        action,
        oldData: oldData ?? Prisma.JsonNull,
        newData: newData ?? Prisma.JsonNull,
      },
    })
  } catch (error) {
    console.error('AuditLog error:', error)
  }
}

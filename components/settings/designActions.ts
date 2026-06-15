'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function saveDesignSettings(formData: FormData) {
  const membership = await requireRole(['ADMIN'])
  const orgId = membership.organizationId

  const appName = formData.get('appName') as string
  const primaryColor = formData.get('primaryColor') as string
  const loginBgColor = formData.get('loginBgColor') as string
  const logoFile = formData.get('logo') as File | null

  let logoUrl: string | undefined
  let logoPath: string | undefined

  // Logo hochladen falls vorhanden
  if (logoFile && logoFile.size > 0) {
    const supabase = await createServerClient()
    const ext = logoFile.name.split('.').pop()
    const filePath = `orgs/${orgId}/logo.${ext}`
    const arrayBuffer = await logoFile.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error } = await supabase.storage
      .from('instruments')
      .upload(filePath, buffer, { contentType: logoFile.type, upsert: true })

    if (error) return { error: `Logo-Upload fehlgeschlagen: ${error.message}` }

    const { data: { publicUrl } } = supabase.storage.from('instruments').getPublicUrl(filePath)
    logoUrl = publicUrl
    logoPath = filePath
  }

  await prisma.organizationSettings.upsert({
    where: { organizationId: orgId },
    update: {
      appName: appName || null,
      primaryColor: primaryColor || null,
      loginBgColor: loginBgColor || null,
      ...(logoUrl && { logoUrl, logoPath }),
    },
    create: {
      organizationId: orgId,
      appName: appName || null,
      primaryColor: primaryColor || null,
      loginBgColor: loginBgColor || null,
      logoUrl: logoUrl ?? null,
      logoPath: logoPath ?? null,
    },
  })

  revalidatePath('/settings/design')
  revalidatePath('/dashboard')

  return { success: true }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const instrumentId = formData.get('instrumentId') as string
    const uploadType = formData.get('type') as 'photo' | 'document'
    const caption = formData.get('caption') as string | null
    const title = formData.get('title') as string | null

    if (!file || !instrumentId || !uploadType) {
      return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
    }

    // Organisation prüfen
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Keine Organisation' }, { status: 403 })
    }

    const orgId = membership.organizationId

    // Instrument prüfen
    const instrument = await prisma.instrument.findFirst({
      where: { id: instrumentId, organizationId: orgId },
    })
    if (!instrument) {
      return NextResponse.json({ error: 'Instrument nicht gefunden' }, { status: 404 })
    }

    // Dateiname generieren
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const folder = uploadType === 'photo' ? 'photos' : 'documents'
    const filePath = `orgs/${orgId}/instruments/${instrumentId}/${folder}/${fileName}`

    // Upload zu Supabase Storage
    const supabase = await createServerClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('instruments')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Public URL holen
    const { data: { publicUrl } } = supabase.storage
      .from('instruments')
      .getPublicUrl(filePath)

    // Datenbankeintrag
    if (uploadType === 'photo') {
      await prisma.instrumentPhoto.create({
        data: {
          instrumentId,
          fileUrl: publicUrl,
          filePath,
          caption: caption || null,
          photoType: 'GENERAL',
          uploadedByUserId: user.id,
        },
      })
    } else {
      await prisma.instrumentDocument.create({
        data: {
          instrumentId,
          fileUrl: publicUrl,
          filePath,
          title: title || file.name,
          documentType: 'OTHER',
          uploadedByUserId: user.id,
        },
      })
    }

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 })
  }
}

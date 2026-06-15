import { createServerClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function getUserProfile(userId: string) {
  return prisma.userProfile.findUnique({
    where: { id: userId },
  })
}

export async function ensureUserProfile(userId: string, email: string) {
  return prisma.userProfile.upsert({
    where: { id: userId },
    update: { email },
    create: {
      id: userId,
      email,
    },
  })
}

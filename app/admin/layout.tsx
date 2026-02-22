import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Strict Admin-Only Layout
  // This layout wraps ALL admin routes and enforces role validation
  // NO navbar, footer, or regular UI elements are included

  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 1. Check Authentication
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Verify Admin Role from Database (single source of truth)
  try {
    const profileResult = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    const profile = profileResult[0]

    if (!profile || profile.role !== 'admin') {
      // Not an admin - redirect to home
      redirect('/')
    }
  } catch (error) {
    console.error('Failed to verify admin role:', error)
    redirect('/login')
  }

  // 3. Render Admin-Only Layout (No Navigation/Footer)
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Content - Isolated from Regular UI */}
      {/* We remove padding here because the children (Dashboard Shell) will manage their own layout */}
      {children}
    </div>
  )
}

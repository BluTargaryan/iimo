import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from './utils/supabase-server'

export const metadata: Metadata = {
  title: 'Home',
  description: 'iimo - Professional photo shoot management platform. Sign up or sign in to manage your photography projects, clients, and usage rights.',
}

export default async function Home() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/studio/shoots')
  }

  redirect('/authenth/signup')
}

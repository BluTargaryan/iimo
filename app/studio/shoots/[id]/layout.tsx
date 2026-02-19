import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'

interface ShootLayoutProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(
  props: ShootLayoutProps
): Promise<Metadata> {
  const { params } = props
  const resolvedParams = await params
  const { id: shootId } = resolvedParams
  
  try {
    const supabase = createSupabaseServerClient()
    
    const { data: shoot, error } = await supabase
      .from('shoots')
      .select('title, shoot_date, clients(name)')
      .eq('id', shootId)
      .single()

    if (error || !shoot) {
      return {
        title: 'Shoot Details',
        description: 'View and manage your photo shoot details, assets, and usage rights in iimo.',
      }
    }

    const shootTitle = shoot.title || 'Untitled Shoot'
    const clientName = (shoot.clients as any)?.name || 'Unknown Client'
    const description = `View shoot "${shootTitle}" for ${clientName}. Manage assets, usage rights, and share previews in iimo.`

    return {
      title: shootTitle,
      description,
    }
  } catch (error) {
    return {
      title: 'Shoot Details',
      description: 'View and manage your photo shoot details, assets, and usage rights in iimo.',
    }
  }
}

export default function ShootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

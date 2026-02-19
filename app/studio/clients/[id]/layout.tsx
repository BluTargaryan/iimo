import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'

interface ClientLayoutProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(
  props: ClientLayoutProps
): Promise<Metadata> {
  const { params } = props
  const resolvedParams = await params
  const { id: clientId } = resolvedParams
  
  try {
    const supabase = createSupabaseServerClient()
    
    const { data: client, error } = await supabase
      .from('clients')
      .select('name, email')
      .eq('id', clientId)
      .single()

    if (error || !client) {
      return {
        title: 'Client Details',
        description: 'View and manage client details, associated shoots, and notes in iimo.',
      }
    }

    const clientName = client.name || 'Unknown Client'
    const description = `View client "${clientName}" details. Manage shoots, notes, and client information in iimo.`

    return {
      title: clientName,
      description,
    }
  } catch (error) {
    return {
      title: 'Client Details',
      description: 'View and manage client details, associated shoots, and notes in iimo.',
    }
  }
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

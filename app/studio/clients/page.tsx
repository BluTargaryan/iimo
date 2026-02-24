import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import { fetchClientsServer } from '@/app/utils/serverData'
import ClientsClient from './ClientsClient'

export default async function ClientsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/authenth/login')

  const { data: clients } = await fetchClientsServer(user.id)

  return <ClientsClient initialClients={clients ?? []} />
}

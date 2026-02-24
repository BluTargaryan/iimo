import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import { fetchNotificationsWithShootServer } from '@/app/utils/serverData'
import EventsClient from './EventsClient'

export default async function EventsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/authenth/login')

  const { data: initialEvents } = await fetchNotificationsWithShootServer(user.id, {
    limit: 20,
    offset: 0,
  })

  return <EventsClient initialEvents={initialEvents ?? []} userId={user.id} />
}

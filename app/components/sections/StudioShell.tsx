import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import { getUnreadNotificationCountServer } from '@/app/utils/serverData'
import TopHeaderLoggedIn from '@/app/components/sections/TopHeaderLoggedIn'

export default async function StudioShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/authenth/login')
  }

  const { data: initialUnreadCount } = await getUnreadNotificationCountServer(user.id)

  return (
    <div className='pt-40 pb-30 px-4 md:px-10 xl:pb-40'>
      <TopHeaderLoggedIn
        userId={user.id}
        initialUnreadCount={initialUnreadCount}
      />
      {children}
    </div>
  )
}

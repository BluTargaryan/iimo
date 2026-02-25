import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import {
  fetchShootByIdServer,
  fetchAssetsServer,
  fetchUsageRightsServer,
  getShareLinkByShootIdServer,
} from '@/app/utils/serverData'
import ShootDetailClient from './ShootDetailClient'

interface ShootDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ShootDetailPage({ params }: ShootDetailPageProps) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/authenth/login')

  const [shootResult, assetsResult, rightsResult, shareLinkResult] = await Promise.all([
    fetchShootByIdServer(id, user.id),
    fetchAssetsServer(id),
    fetchUsageRightsServer(id),
    getShareLinkByShootIdServer(id, user.id),
  ])

  if (shootResult.error || !shootResult.data) notFound()

  return (
    <ShootDetailClient
      shootId={id}
      initialShoot={shootResult.data}
      initialAssets={assetsResult.data ?? []}
      initialUsageRights={rightsResult.data ?? []}
      initialShareLink={shareLinkResult.data ?? null}
    />
  )
}

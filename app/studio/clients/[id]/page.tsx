import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import {
  fetchClientByIdServer,
  fetchNotesServer,
  fetchShootsByClientServer,
  fetchAssetsForShootsServer,
  getAssetUrl,
  getWatermarkedImageUrl,
} from '@/app/utils/serverData'
import ClientDetailClient from './ClientDetailClient'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/authenth/login')

  const [clientResult, notesResult, shootsResult] = await Promise.all([
    fetchClientByIdServer(id, user.id),
    fetchNotesServer(id),
    fetchShootsByClientServer(id, user.id),
  ])

  if (clientResult.error || !clientResult.data) notFound()

  const shootsData = shootsResult.data ?? []
  const shootIds = shootsData.map((s) => s.id)
  const { data: assetsByShoot } = await fetchAssetsForShootsServer(shootIds)

  const shootThumbnails: Record<string, string[]> = {}
  shootsData.forEach((shoot) => {
    const assets = assetsByShoot?.[shoot.id] ?? []
    if (assets.length > 0) {
      shootThumbnails[shoot.id] = assets.slice(0, 4).map((asset) => {
        return getWatermarkedImageUrl(asset.watermarked_image) ?? getAssetUrl(asset.image)
      })
    } else {
      shootThumbnails[shoot.id] = []
    }
  })

  return (
    <ClientDetailClient
      clientId={id}
      initialClient={clientResult.data}
      initialNotes={notesResult.data ?? []}
      initialShoots={shootsData}
      initialShootThumbnails={shootThumbnails}
    />
  )
}

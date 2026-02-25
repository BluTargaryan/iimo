import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import {
  fetchShootsServer,
  fetchAssetsForShootsServer,
  getAssetUrl,
  getWatermarkedImageUrl,
} from '@/app/utils/serverData'
import ShootsClient from './ShootsClient'

export default async function ShootsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/authenth/login')

  const { data: shoots } = await fetchShootsServer(user.id)
  const shootsData = shoots ?? []

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

  return <ShootsClient shoots={shootsData} shootThumbnails={shootThumbnails} />
}

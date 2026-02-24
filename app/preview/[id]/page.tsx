import { createSupabaseServerClient } from '@/app/utils/supabase-server'
import {
  getShootIdByTokenServer,
  fetchAssetsServer,
  fetchUsageRightsServer,
} from '@/app/utils/serverData'
import PreviewClient from './PreviewClient'
import type { ShootWithClient } from '@/app/utils/shootOperations'

interface PreviewPageProps {
  params: Promise<{ id: string }>
}

const NOT_FOUND_MESSAGE = 'This share link does not exist or is no longer valid.'
const LOAD_FAILED_MESSAGE = 'Unable to load preview.'

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id: shareToken } = await params

  const supabase = await createSupabaseServerClient()

  const { data: shootId, error: tokenError } = await getShootIdByTokenServer(shareToken)

  if (tokenError || !shootId) {
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span className='text-red-500'>{NOT_FOUND_MESSAGE}</span>
        </div>
      </main>
    )
  }

  const [shootResult, assetsResult, rightsResult] = await Promise.all([
    supabase
      .from('shoots')
      .select(`*, clients(id, name, email)`)
      .eq('id', shootId)
      .single(),
    fetchAssetsServer(shootId),
    fetchUsageRightsServer(shootId),
  ])

  if (shootResult.error || !shootResult.data) {
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span className='text-red-500'>{LOAD_FAILED_MESSAGE}</span>
        </div>
      </main>
    )
  }

  return (
    <PreviewClient
      shootData={shootResult.data as ShootWithClient}
      assets={assetsResult.data ?? []}
      usageRights={rightsResult.data ?? []}
    />
  )
}

import { createSupabaseServerClient } from './supabase-server'
import type { ShootWithClient } from './shootOperations'
import type { Client, Note } from './clientOperations'
import type { Asset } from './assetOperations'
import type { NotificationWithRelations } from './notificationOperations'
import type { ShareLink } from './shareLinksOperations'
import type { UsageRights } from './usageRightsOperations'

// Pure URL builders — no Supabase client needed
export function getAssetUrl(imagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${imagePath}`
}

export function getWatermarkedImageUrl(watermarkedImagePath: string | null): string | null {
  if (!watermarkedImagePath) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${watermarkedImagePath}`
}

// --- Tier 1: List pages ---

export async function fetchShootsServer(
  userId: string
): Promise<{ data: ShootWithClient[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('shoots')
    .select('*, clients(id, name, email)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as ShootWithClient[], error: null }
}

export async function fetchAssetsForShootsServer(
  shootIds: string[]
): Promise<{ data: Record<string, Asset[]> | null; error: Error | null }> {
  if (shootIds.length === 0) return { data: {}, error: null }
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .in('shoot_id', shootIds)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  const grouped: Record<string, Asset[]> = {}
  shootIds.forEach((id) => { grouped[id] = [] })
  if (data) {
    data.forEach((asset: Asset) => {
      if (!grouped[asset.shoot_id]) grouped[asset.shoot_id] = []
      grouped[asset.shoot_id].push(asset)
    })
  }
  return { data: grouped, error: null }
}

export async function fetchClientsServer(
  userId: string
): Promise<{ data: Client[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as Client[], error: null }
}

export async function fetchNotificationsWithShootServer(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: NotificationWithRelations[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0
  const { data, error } = await supabase
    .from('notifications')
    .select(`*, shoots(id, title)`)
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as NotificationWithRelations[], error: null }
}

export async function getUnreadNotificationCountServer(
  userId: string
): Promise<{ data: number; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'sent'])
  if (error) return { data: 0, error: new Error(error.message) }
  return { data: count ?? 0, error: null }
}

// --- Tier 2: Detail pages ---

export async function fetchShootByIdServer(
  shootId: string,
  userId: string
): Promise<{ data: ShootWithClient | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('shoots')
    .select(`*, clients(id, name, email)`)
    .eq('id', shootId)
    .eq('user_id', userId)
    .single()
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as ShootWithClient, error: null }
}

export async function fetchAssetsServer(
  shootId: string
): Promise<{ data: Asset[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('shoot_id', shootId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as Asset[], error: null }
}

export async function fetchUsageRightsServer(
  shootId: string
): Promise<{ data: UsageRights[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('usage_rights')
    .select('*')
    .eq('shoot_id', shootId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as UsageRights[], error: null }
}

export async function getShareLinkByShootIdServer(
  shootId: string,
  userId: string
): Promise<{ data: ShareLink | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data: shoot } = await supabase
    .from('shoots')
    .select('id')
    .eq('id', shootId)
    .eq('user_id', userId)
    .single()
  if (!shoot) return { data: null, error: new Error('Shoot not found or access denied') }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('share_links')
    .select('*')
    .eq('shoot_id', shootId)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as ShareLink | null, error: null }
}

export async function getShootIdByTokenServer(
  shareToken: string
): Promise<{ data: string | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc('get_shoot_id_by_share_token', { token: shareToken })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as string | null, error: null }
}

export async function fetchClientByIdServer(
  clientId: string,
  userId: string
): Promise<{ data: Client | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single()
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as Client, error: null }
}

export async function fetchNotesServer(
  clientId: string
): Promise<{ data: Note[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as Note[], error: null }
}

export async function fetchShootsByClientServer(
  clientId: string,
  userId: string
): Promise<{ data: ShootWithClient[] | null; error: Error | null }> {
  const supabase = await createSupabaseServerClient()
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single()
  if (!client) return { data: null, error: new Error('Client not found or access denied') }

  const { data, error } = await supabase
    .from('shoots')
    .select('*, clients(id, name, email)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as ShootWithClient[], error: null }
}

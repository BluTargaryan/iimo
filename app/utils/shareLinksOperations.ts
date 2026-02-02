import { supabase } from './supabase'

export interface ShareLink {
  id: string
  shoot_id: string
  share_token: string
  expires_at: string | null
  created_at: string
  revoked_at: string | null
}

/**
 * Helper function to verify that the current user owns the shoot
 */
async function verifyShootOwnership(shootId: string): Promise<{ valid: boolean; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { valid: false, error: new Error('User not authenticated') }
    }

    const { data: shoot, error: shootError } = await supabase
      .from('shoots')
      .select('id, user_id')
      .eq('id', shootId)
      .eq('user_id', user.id)
      .single()

    if (shootError || !shoot) {
      return { valid: false, error: new Error('Shoot not found or access denied') }
    }

    return { valid: true, error: null }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error : new Error('Failed to verify shoot ownership'),
    }
  }
}

/**
 * Generate a secure random token for share links (32-char alphanumeric)
 */
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}

/**
 * Generate a share link for a shoot. Creates a new row in share_links and returns the share URL.
 */
export async function generateShareLink(
  shootId: string,
  expiresInDays?: number
): Promise<{ data: { shareLink: ShareLink; shareUrl: string } | null; error: Error | null }> {
  try {
    const { valid, error: ownershipError } = await verifyShootOwnership(shootId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const shareToken = generateShareToken()
    const now = new Date()
    const expiresAt = expiresInDays != null
      ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data: newLink, error } = await supabase
      .from('share_links')
      .insert({
        shoot_id: shootId,
        share_token: shareToken,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating share link:', error)
      return { data: null, error: new Error(error.message) }
    }

    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/preview/${shareToken}`
      : `${process.env.NEXT_PUBLIC_APP_URL || ''}/preview/${shareToken}`

    return {
      data: { shareLink: newLink as ShareLink, shareUrl },
      error: null,
    }
  } catch (error) {
    console.error('Unexpected error creating share link:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create share link'),
    }
  }
}

/**
 * Fetch the active (non-revoked, non-expired) share link for a shoot.
 */
export async function getShareLinkByShootId(
  shootId: string
): Promise<{ data: ShareLink | null; error: Error | null }> {
  try {
    const { valid, error: ownershipError } = await verifyShootOwnership(shootId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

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

    if (error) {
      console.error('Error fetching share link:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as ShareLink | null, error: null }
  } catch (error) {
    console.error('Unexpected error fetching share link:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch share link'),
    }
  }
}

/**
 * Update the expiry date of a share link.
 */
export async function updateShareLinkExpiry(
  linkId: string,
  expiresAt: Date
): Promise<{ data: ShareLink | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('share_links')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', linkId)
      .select()
      .single()

    if (error) {
      console.error('Error updating share link expiry:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as ShareLink, error: null }
  } catch (error) {
    console.error('Unexpected error updating share link expiry:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update share link expiry'),
    }
  }
}

/**
 * Revoke a share link by setting revoked_at.
 */
export async function revokeShareLink(linkId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: new Error('User not authenticated') }
    }

    const { error } = await supabase
      .from('share_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', linkId)

    if (error) {
      console.error('Error revoking share link:', error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error revoking share link:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to revoke share link'),
    }
  }
}

/**
 * Resolve a share token to shoot_id using the Supabase function (for public preview).
 * Returns null if token is invalid, expired, or revoked.
 */
export async function getShootIdByToken(
  shareToken: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_shoot_id_by_share_token', {
      token: shareToken,
    })

    if (error) {
      console.error('Error resolving share token:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as string | null, error: null }
  } catch (error) {
    console.error('Unexpected error resolving share token:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to resolve share token'),
    }
  }
}

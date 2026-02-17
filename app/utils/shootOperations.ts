import { supabase } from './supabase'

export interface Shoot {
  id: string
  user_id: string
  client_id: string
  title: string
  shoot_date: string | null
  status: 'active' | 'expiring' | 'expired' | 'archived'
  created_at: string
  updated_at: string
}

export interface ShootWithClient extends Shoot {
  clients?: {
    id: string
    name: string
    email: string | null
  }
}

/**
 * Fetch shoots for a user, optionally filtered by status
 */
export async function fetchShoots(
  userId: string,
  status?: 'Active' | 'Expiring' | 'Expired' | 'Archived'
): Promise<{ data: Shoot[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('shoots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply status filter (map UI status to database status)
    if (status) {
      const dbStatus = status.toLowerCase() as 'active' | 'expiring' | 'expired' | 'archived'
      query = query.eq('status', dbStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching shoots:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Shoot[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching shoots:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch shoots'),
    }
  }
}

/**
 * Fetch shoots for a specific client
 */
export async function fetchShootsByClient(
  clientId: string,
  status?: 'Active' | 'Expiring' | 'Expired' | 'Archived'
): Promise<{ data: Shoot[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('shoots')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    // Apply status filter (map UI status to database status)
    if (status) {
      const dbStatus = status.toLowerCase() as 'active' | 'expiring' | 'expired' | 'archived'
      query = query.eq('status', dbStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching shoots by client:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Shoot[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching shoots by client:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch shoots by client'),
    }
  }
}

/**
 * Fetch a single shoot by ID with client relationship
 */
export async function fetchShootById(
  shootId: string
): Promise<{ data: ShootWithClient | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('shoots')
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .eq('id', shootId)
      .single()

    if (error) {
      console.error('Error fetching shoot:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as ShootWithClient, error: null }
  } catch (error) {
    console.error('Unexpected error fetching shoot:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch shoot'),
    }
  }
}

/**
 * Create a new shoot
 */
export async function createShoot(
  data: {
    user_id: string
    client_id: string
    title: string
    shoot_date?: string
    status?: 'active' | 'expiring' | 'expired' | 'archived'
  }
): Promise<{ data: Shoot | null; error: Error | null }> {
  try {
    const { data: newShoot, error } = await supabase
      .from('shoots')
      .insert({
        user_id: data.user_id,
        client_id: data.client_id,
        title: data.title,
        shoot_date: data.shoot_date || null,
        status: data.status || 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating shoot:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: newShoot as Shoot, error: null }
  } catch (error) {
    console.error('Unexpected error creating shoot:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create shoot'),
    }
  }
}

/**
 * Update shoot details
 */
export async function updateShoot(
  shootId: string,
  data: {
    title?: string
    client_id?: string
    shoot_date?: string
    status?: 'active' | 'expiring' | 'expired' | 'archived'
  }
): Promise<{ data: Shoot | null; error: Error | null }> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.title !== undefined) {
      updateData.title = data.title
    }
    if (data.client_id !== undefined) {
      updateData.client_id = data.client_id
    }
    if (data.shoot_date !== undefined) {
      updateData.shoot_date = data.shoot_date || null
    }
    if (data.status !== undefined) {
      updateData.status = data.status
    }

    const { data: updatedShoot, error } = await supabase
      .from('shoots')
      .update(updateData)
      .eq('id', shootId)
      .select()
      .single()

    if (error) {
      console.error('Error updating shoot:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: updatedShoot as Shoot, error: null }
  } catch (error) {
    console.error('Unexpected error updating shoot:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update shoot'),
    }
  }
}

/**
 * Update shoot status
 */
export async function updateShootStatus(
  shootId: string,
  status: 'active' | 'expiring' | 'expired' | 'archived'
): Promise<{ data: Shoot | null; error: Error | null }> {
  try {
    const { data: updatedShoot, error } = await supabase
      .from('shoots')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shootId)
      .select()
      .single()

    if (error) {
      console.error('Error updating shoot status:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: updatedShoot as Shoot, error: null }
  } catch (error) {
    console.error('Unexpected error updating shoot status:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update shoot status'),
    }
  }
}

/**
 * Delete a shoot (cascades to assets via foreign key)
 */
export async function deleteShoot(
  shootId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('shoots')
      .delete()
      .eq('id', shootId)

    if (error) {
      console.error('Error deleting shoot:', error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting shoot:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to delete shoot'),
    }
  }
}

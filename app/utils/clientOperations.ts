import { supabase } from './supabase'

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  client_id: string
  content: string
  created_at: string
  updated_at: string
}

/**
 * Helper function to verify that the current user owns the client
 */
async function verifyClientOwnership(clientId: string): Promise<{ valid: boolean; error: Error | null }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { valid: false, error: new Error('User not authenticated') }
    }

    // Check if client exists and belongs to user
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return { valid: false, error: new Error('Client not found or access denied') }
    }

    return { valid: true, error: null }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error : new Error('Failed to verify client ownership'),
    }
  }
}

/**
 * Fetch clients for a user, optionally filtered by status
 */
export async function fetchClients(
  userId: string,
  status?: 'active' | 'archived'
): Promise<{ data: Client[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Client[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching clients:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch clients'),
    }
  }
}

/**
 * Fetch a single client by ID
 */
export async function fetchClientById(
  clientId: string
): Promise<{ data: Client | null; error: Error | null }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Client, error: null }
  } catch (error) {
    console.error('Unexpected error fetching client:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch client'),
    }
  }
}

/**
 * Create a new client
 */
export async function createClient(
  userId: string,
  data: { name: string; email?: string }
): Promise<{ data: Client | null; error: Error | null }> {
  try {
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        name: data.name,
        email: data.email || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: newClient as Client, error: null }
  } catch (error) {
    console.error('Unexpected error creating client:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create client'),
    }
  }
}

/**
 * Update client details
 */
export async function updateClient(
  clientId: string,
  data: { name?: string; email?: string }
): Promise<{ data: Client | null; error: Error | null }> {
  try {
    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(clientId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const updateData: { name?: string; email?: string | null; updated_at?: string } = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.email !== undefined) {
      updateData.email = data.email || null
    }

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: updatedClient as Client, error: null }
  } catch (error) {
    console.error('Unexpected error updating client:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update client'),
    }
  }
}

/**
 * Archive a client (set status to 'archived')
 */
export async function archiveClient(
  clientId: string
): Promise<{ data: Client | null; error: Error | null }> {
  try {
    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(clientId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const { data: archivedClient, error } = await supabase
      .from('clients')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error archiving client:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: archivedClient as Client, error: null }
  } catch (error) {
    console.error('Unexpected error archiving client:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to archive client'),
    }
  }
}

/**
 * Restore a client (set status to 'active')
 */
export async function restoreClient(
  clientId: string
): Promise<{ data: Client | null; error: Error | null }> {
  try {
    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(clientId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const { data: restoredClient, error } = await supabase
      .from('clients')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error restoring client:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: restoredClient as Client, error: null }
  } catch (error) {
    console.error('Unexpected error restoring client:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to restore client'),
    }
  }
}

/**
 * Fetch all notes for a client
 */
export async function fetchNotes(
  clientId: string
): Promise<{ data: Note[] | null; error: Error | null }> {
  try {
    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(clientId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Note[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching notes:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch notes'),
    }
  }
}

/**
 * Create a new note for a client
 */
export async function createNote(
  clientId: string,
  content: string
): Promise<{ data: Note | null; error: Error | null }> {
  try {
    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(clientId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        client_id: clientId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: newNote as Note, error: null }
  } catch (error) {
    console.error('Unexpected error creating note:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create note'),
    }
  }
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  content: string
): Promise<{ data: Note | null; error: Error | null }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Fetch note to get client_id
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('client_id')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      return { data: null, error: new Error('Note not found') }
    }

    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(note.client_id)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    const { data: updatedNote, error } = await supabase
      .from('notes')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: updatedNote as Note, error: null }
  } catch (error) {
    console.error('Unexpected error updating note:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update note'),
    }
  }
}

/**
 * Delete a note
 */
export async function deleteNote(
  noteId: string
): Promise<{ error: Error | null }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: new Error('User not authenticated') }
    }

    // Fetch note to get client_id
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('client_id')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      return { error: new Error('Note not found') }
    }

    // Verify user owns the client
    const { valid, error: ownershipError } = await verifyClientOwnership(note.client_id)
    if (!valid) {
      return { error: ownershipError || new Error('Access denied') }
    }

    const { error } = await supabase.from('notes').delete().eq('id', noteId)

    if (error) {
      console.error('Error deleting note:', error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting note:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to delete note'),
    }
  }
}

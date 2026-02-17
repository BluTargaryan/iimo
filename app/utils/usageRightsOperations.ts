import { supabase } from './supabase'

export interface UsageRights {
  id: string
  shoot_id: string
  usage_types: string[]
  start_date: string | null
  end_date: string | null
  restrictions: string | null
  contract: string | null
  created_at: string
  updated_at: string
}

/**
 * Helper function to verify that the current user owns the shoot
 */
async function verifyShootOwnership(shootId: string): Promise<{ valid: boolean; error: Error | null }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { valid: false, error: new Error('User not authenticated') }
    }

    // Check if shoot exists and belongs to user
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
 * Upload a contract PDF to Storage
 */
export async function uploadContract(
  shootId: string,
  file: File
): Promise<{ data: string | null; error: Error | null }> {
  try {
    // Verify user owns the shoot
    const { valid, error: ownershipError } = await verifyShootOwnership(shootId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    // Generate unique contract ID
    const contractId = crypto.randomUUID()
    const fileExt = file.name.split('.').pop() || 'pdf'
    const fileName = `${contractId}.${fileExt}`
    
    // Upload contract file
    const filePath = `shoots/${shootId}/contracts/${fileName}`
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading contract:', uploadError)
      return { data: null, error: new Error(uploadError.message) }
    }

    // Get public URL
    const { data } = supabase.storage.from('contracts').getPublicUrl(filePath)
    return { data: data.publicUrl, error: null }
  } catch (error) {
    console.error('Unexpected error uploading contract:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to upload contract'),
    }
  }
}

/**
 * Create usage rights for a shoot
 */
export async function createUsageRights(
  shootId: string,
  data: {
    usage_types: string[]
    start_date?: string | null
    end_date?: string | null
    restrictions?: string | null
    contract?: File | null
  }
): Promise<{ data: UsageRights | null; error: Error | null }> {
  try {
    // Verify user owns the shoot
    const { valid, error: ownershipError } = await verifyShootOwnership(shootId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    let contractUrl: string | null = null

    // Upload contract if provided
    if (data.contract) {
      const { data: uploadedUrl, error: uploadError } = await uploadContract(shootId, data.contract)
      
      if (uploadError) {
        return { data: null, error: uploadError }
      }
      
      contractUrl = uploadedUrl
    }

    // Insert usage rights record
    const { data: newRights, error: insertError } = await supabase
      .from('usage_rights')
      .insert({
        shoot_id: shootId,
        usage_types: data.usage_types,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        restrictions: data.restrictions || null,
        contract: contractUrl,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating usage rights:', insertError)
      // Try to clean up uploaded contract if insert fails
      if (contractUrl) {
        // Extract path from URL and delete
        const urlParts = contractUrl.split('/contracts/')
        if (urlParts.length > 1) {
          const filePath = `shoots/${shootId}/contracts/${urlParts[1]}`
          await supabase.storage.from('contracts').remove([filePath])
        }
      }
      return { data: null, error: new Error(insertError.message) }
    }

    return { data: newRights as UsageRights, error: null }
  } catch (error) {
    console.error('Unexpected error creating usage rights:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create usage rights'),
    }
  }
}

/**
 * Fetch usage rights for a shoot
 * For authenticated users, verifies ownership. For unauthenticated (preview), allows access.
 */
export async function fetchUsageRights(
  shootId: string
): Promise<{ data: UsageRights[] | null; error: Error | null }> {
  try {
    // Check if user is authenticated - if so, verify ownership
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { valid, error: ownershipError } = await verifyShootOwnership(shootId)
      if (!valid) {
        return { data: null, error: ownershipError || new Error('Access denied') }
      }
    }

    const { data, error } = await supabase
      .from('usage_rights')
      .select('*')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching usage rights:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as UsageRights[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching usage rights:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch usage rights'),
    }
  }
}

/**
 * Update existing usage rights
 */
export async function updateUsageRights(
  rightsId: string,
  data: {
    usage_types?: string[]
    start_date?: string | null
    end_date?: string | null
    restrictions?: string | null
    contract?: File | null
  }
): Promise<{ data: UsageRights | null; error: Error | null }> {
  try {
    // Fetch existing rights to get shoot_id
    const { data: existingRights, error: fetchError } = await supabase
      .from('usage_rights')
      .select('shoot_id, contract')
      .eq('id', rightsId)
      .single()

    if (fetchError || !existingRights) {
      return { data: null, error: new Error('Usage rights not found') }
    }

    // Verify user owns the shoot
    const { valid, error: ownershipError } = await verifyShootOwnership(existingRights.shoot_id)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    let contractUrl: string | null = existingRights.contract

    // Upload new contract if provided
    if (data.contract) {
      // Delete old contract if exists
      if (contractUrl) {
        const urlParts = contractUrl.split('/contracts/')
        if (urlParts.length > 1) {
          const filePath = `shoots/${existingRights.shoot_id}/contracts/${urlParts[1]}`
          await supabase.storage.from('contracts').remove([filePath])
        }
      }

      // Upload new contract
      const { data: uploadedUrl, error: uploadError } = await uploadContract(
        existingRights.shoot_id,
        data.contract
      )
      
      if (uploadError) {
        return { data: null, error: uploadError }
      }
      
      contractUrl = uploadedUrl
    }

    // Update usage rights record
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.usage_types !== undefined) {
      updateData.usage_types = data.usage_types
    }
    if (data.start_date !== undefined) {
      updateData.start_date = data.start_date || null
    }
    if (data.end_date !== undefined) {
      updateData.end_date = data.end_date || null
    }
    if (data.restrictions !== undefined) {
      updateData.restrictions = data.restrictions || null
    }
    if (contractUrl !== undefined) {
      updateData.contract = contractUrl
    }

    const { data: updatedRights, error: updateError } = await supabase
      .from('usage_rights')
      .update(updateData)
      .eq('id', rightsId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating usage rights:', updateError)
      return { data: null, error: new Error(updateError.message) }
    }

    return { data: updatedRights as UsageRights, error: null }
  } catch (error) {
    console.error('Unexpected error updating usage rights:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update usage rights'),
    }
  }
}

/**
 * Delete usage rights record
 */
export async function deleteUsageRights(
  rightsId: string
): Promise<{ error: Error | null }> {
  try {
    // Fetch existing rights to get contract URL and shoot_id
    const { data: existingRights, error: fetchError } = await supabase
      .from('usage_rights')
      .select('contract, shoot_id')
      .eq('id', rightsId)
      .single()

    if (fetchError || !existingRights) {
      return { error: new Error('Usage rights not found') }
    }

    // Verify user owns the shoot
    const { valid, error: ownershipError } = await verifyShootOwnership(existingRights.shoot_id)
    if (!valid) {
      return { error: ownershipError || new Error('Access denied') }
    }

    // Delete contract from Storage if exists
    if (existingRights.contract) {
      const urlParts = existingRights.contract.split('/contracts/')
      if (urlParts.length > 1) {
        const filePath = `shoots/${existingRights.shoot_id}/contracts/${urlParts[1]}`
        await supabase.storage.from('contracts').remove([filePath])
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('usage_rights')
      .delete()
      .eq('id', rightsId)

    if (deleteError) {
      console.error('Error deleting usage rights:', deleteError)
      return { error: new Error(deleteError.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting usage rights:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to delete usage rights'),
    }
  }
}

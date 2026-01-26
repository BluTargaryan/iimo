import { supabase } from './supabase'

export interface Asset {
  id: string
  shoot_id: string
  image: string
  thumbnail: string | null
  watermarked_image: string | null
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
 * Get public URL for an asset image from Storage path
 */
export function getAssetUrl(imagePath: string): string {
  const { data } = supabase.storage.from('assets').getPublicUrl(imagePath)
  return data.publicUrl
}

/**
 * Get public URL for a thumbnail from Storage path
 */
export function getThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath) return null
  const { data } = supabase.storage.from('assets').getPublicUrl(thumbnailPath)
  return data.publicUrl
}

/**
 * Get public URL for a watermarked image from Storage path
 */
export function getWatermarkedImageUrl(watermarkedImagePath: string | null): string | null {
  if (!watermarkedImagePath) return null
  const { data } = supabase.storage.from('assets').getPublicUrl(watermarkedImagePath)
  return data.publicUrl
}

/**
 * Upload a single asset with optional thumbnail and watermarked image
 */
export async function uploadAsset(
  shootId: string,
  file: File,
  thumbnail?: File,
  watermarkedImage?: File
): Promise<{ data: Asset | null; error: Error | null }> {
  try {
    // Verify user owns the shoot
    const { valid, error: ownershipError } = await verifyShootOwnership(shootId)
    if (!valid) {
      return { data: null, error: ownershipError || new Error('Access denied') }
    }

    // Generate unique asset ID
    const assetId = crypto.randomUUID()
    const fileExt = file.name.split('.').pop()
    const fileName = `${assetId}.${fileExt}`
    
    // Upload original file
    const filePath = `shoots/${shootId}/assets/${fileName}`
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading asset:', uploadError)
      return { data: null, error: new Error(uploadError.message) }
    }

    // Upload thumbnail if provided
    let thumbnailPath: string | null = null
    if (thumbnail) {
      const thumbnailExt = thumbnail.name.split('.').pop()
      const thumbnailName = `${assetId}.${thumbnailExt}`
      thumbnailPath = `shoots/${shootId}/thumbnails/${thumbnailName}`
      
      const { error: thumbnailError } = await supabase.storage
        .from('assets')
        .upload(thumbnailPath, thumbnail, {
          cacheControl: '3600',
          upsert: false
        })

      if (thumbnailError) {
        console.error('Error uploading thumbnail:', thumbnailError)
        // Continue even if thumbnail upload fails
      }
    }

    // Upload watermarked image if provided
    let watermarkedImagePath: string | null = null
    if (watermarkedImage) {
      const watermarkedExt = watermarkedImage.name.split('.').pop() || 'jpg'
      const watermarkedName = `${assetId}_watermarked.${watermarkedExt}`
      watermarkedImagePath = `shoots/${shootId}/watermarked/${watermarkedName}`
      
      const { error: watermarkedError } = await supabase.storage
        .from('assets')
        .upload(watermarkedImagePath, watermarkedImage, {
          cacheControl: '3600',
          upsert: false
        })

      if (watermarkedError) {
        console.error('Error uploading watermarked image:', watermarkedError)
        // Continue even if watermarked image upload fails
      }
    }

    // Insert asset record
    const { data: newAsset, error: insertError } = await supabase
      .from('assets')
      .insert({
        shoot_id: shootId,
        image: filePath,
        thumbnail: thumbnailPath,
        watermarked_image: watermarkedImagePath,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating asset record:', insertError)
      // Try to clean up uploaded files
      await supabase.storage.from('assets').remove([filePath])
      if (thumbnailPath) {
        await supabase.storage.from('assets').remove([thumbnailPath])
      }
      if (watermarkedImagePath) {
        await supabase.storage.from('assets').remove([watermarkedImagePath])
      }
      return { data: null, error: new Error(insertError.message) }
    }

    return { data: newAsset as Asset, error: null }
  } catch (error) {
    console.error('Unexpected error uploading asset:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to upload asset'),
    }
  }
}

/**
 * Upload multiple assets with optional shared thumbnail and watermarked images
 */
export async function uploadMultipleAssets(
  shootId: string,
  files: File[],
  thumbnail?: File,
  watermarkedImages?: (File | undefined)[],
  onProgress?: (progress: number) => void
): Promise<{ data: Asset[] | null; error: Error | null }> {
  try {
    const assets: Asset[] = []
    const total = files.length
    let completed = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const watermarkedImage = watermarkedImages && watermarkedImages[i] ? watermarkedImages[i] : undefined
      const result = await uploadAsset(shootId, file, thumbnail, watermarkedImage)
      
      if (result.error) {
        console.error(`Error uploading asset ${file.name}:`, result.error)
        // Continue with other files
        continue
      }

      if (result.data) {
        assets.push(result.data)
      }

      completed++
      if (onProgress) {
        onProgress((completed / total) * 100)
      }
    }

    if (assets.length === 0) {
      return {
        data: null,
        error: new Error('Failed to upload any assets'),
      }
    }

    return { data: assets, error: null }
  } catch (error) {
    console.error('Unexpected error uploading multiple assets:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to upload assets'),
    }
  }
}

/**
 * Fetch all assets for a shoot
 */
export async function fetchAssets(
  shootId: string
): Promise<{ data: Asset[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assets:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Asset[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching assets:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch assets'),
    }
  }
}

/**
 * Fetch a single asset by ID
 */
export async function fetchAssetById(
  assetId: string
): Promise<{ data: Asset | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) {
      console.error('Error fetching asset:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Asset, error: null }
  } catch (error) {
    console.error('Unexpected error fetching asset:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch asset'),
    }
  }
}

/**
 * Delete an asset from Storage and database
 */
export async function deleteAsset(
  assetId: string
): Promise<{ error: Error | null }> {
  try {
    // First fetch the asset to get file paths
    const { data: asset, error: fetchError } = await fetchAssetById(assetId)
    
    if (fetchError || !asset) {
      return { error: fetchError || new Error('Asset not found') }
    }

    // Delete from Storage
    const filesToDelete: string[] = [asset.image]
    if (asset.thumbnail) {
      filesToDelete.push(asset.thumbnail)
    }
    if (asset.watermarked_image) {
      filesToDelete.push(asset.watermarked_image)
    }

    const { error: storageError } = await supabase.storage
      .from('assets')
      .remove(filesToDelete)

    if (storageError) {
      console.error('Error deleting asset files from storage:', storageError)
      // Continue to delete database record even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)

    if (deleteError) {
      console.error('Error deleting asset record:', deleteError)
      return { error: new Error(deleteError.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting asset:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to delete asset'),
    }
  }
}


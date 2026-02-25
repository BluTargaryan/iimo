'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { uploadMultipleAssets } from '@/app/utils/assetOperations'
import { compositeThumbnailOnPhoto } from '@/app/utils/imageCompositor'
import PhotoUploadGrid from '@/app/components/atoms/PhotoUploadGrid'
import ThumbnailUpload from '@/app/components/atoms/ThumbnailUpload'
import Button from '@/app/components/atoms/Button'

const UploadAssetsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shootId = searchParams.get('shootId')

  const [photos, setPhotos] = useState<File[]>([])
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const paramError = !shootId ? 'Shoot ID is required' : null
  const displayError = paramError || error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shootId) {
      setError('Shoot ID is required')
      return
    }

    if (photos.length === 0) {
      setError('Please select at least one photo')
      return
    }

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // If thumbnail is provided, generate composited images (watermarked images) for each photo
      // Keep original photos as the main images, composited versions as watermarked images
      let watermarkedImages: (File | undefined)[] | undefined = undefined

      if (thumbnail) {
        // Generate composited images (photo + thumbnail overlay) as watermarked images
        const compositedFiles: (File | undefined)[] = []
        for (const photo of photos) {
          try {
            const composited = await compositeThumbnailOnPhoto(photo, thumbnail)
            compositedFiles.push(composited)
          } catch (err) {
            console.error('Error compositing image:', err)
            // If composition fails, don't include a watermarked version for this photo
            compositedFiles.push(undefined)
          }
        }
        watermarkedImages = compositedFiles
      }

      // Upload original photos as main images, composited versions as watermarked images
      const { error: uploadError } = await uploadMultipleAssets(
        shootId,
        photos, // Original photos as main images
        thumbnail || undefined,
        watermarkedImages, // Composited images as watermarked images (may have undefined entries)
        (progress) => {
          setUploadProgress(progress)
        }
      )

      if (uploadError) {
        setError(uploadError.message)
        setLoading(false)
        return
      }

      // Navigate to shoot details page
      router.push(`/studio/shoots/${shootId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload assets')
      setLoading(false)
    }
  }

  const handleDoLater = () => {
    if (shootId) {
      router.push(`/studio/shoots/${shootId}`)
    } else {
      router.back()
    }
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>Upload assets</h1>

      {displayError && (
        <div className='w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
          {displayError}
        </div>
      )}

      {loading && uploadProgress > 0 && (
        <div className='w-full mb-4'>
          <div className='w-full bg-gray-200 rounded-full h-2.5'>
            <div 
              className='bg-foreground h-2.5 rounded-full transition-all duration-300'
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className='text-sm mt-2 text-center'>Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='w-full col-flex gap-12'>
        <PhotoUploadGrid 
          maxPhotos={6} 
          onPhotosChange={setPhotos}
        />

        <ThumbnailUpload 
          onThumbnailChange={setThumbnail}
          photos={photos}
          disabled={photos.length === 0}
        />

        <div className='w-full col-flex gap-3.5'>
          <Button 
            type="submit" 
            className='bg-foreground text-background w-full p-3.5'
            disabled={loading || !shootId || photos.length === 0}
          >
            {loading ? 'Uploading...' : 'Upload images'}
          </Button>
          <Button 
            type="button" 
            className='bg-background text-foreground border border-foreground w-full p-3.5'
            onClick={handleDoLater}
            disabled={loading}
          >
            Do this later
          </Button>
        </div>
      </form>
    </main>
  )
}

export default UploadAssetsPage


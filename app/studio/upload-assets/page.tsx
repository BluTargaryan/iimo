'use client'

import React, { useState } from 'react'
import PhotoUploadGrid from '@/app/components/atoms/PhotoUploadGrid'
import ThumbnailUpload from '@/app/components/atoms/ThumbnailUpload'
import Button from '@/app/components/atoms/Button'

const UploadAssetsPage = () => {
  const [photos, setPhotos] = useState<File[]>([])
  const [thumbnail, setThumbnail] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Photos:', photos)
    console.log('Thumbnail:', thumbnail)
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>Upload assets</h1>

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
<Button type="submit" className='bg-foreground text-background w-full p-3.5'>
         Upload images
        </Button>
        <Button type="submit" className='bg-background text-foreground border border-foreground w-full p-3.5'>
          Do this later
        </Button>
</div>
        
      </form>
    </main>
  )
}

export default UploadAssetsPage


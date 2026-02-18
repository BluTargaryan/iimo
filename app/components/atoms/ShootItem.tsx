'use client'
import React from 'react'
import Image from 'next/image'
import Button from './Button'
import share from '@/app/assets/images/share.svg'
import { useRouter } from 'next/navigation'
import { type Shoot } from '@/app/utils/shootOperations'

interface ShootItemProps {
  shoot: Shoot
  onShare?: () => void
  thumbnailUrls?: string[] // Optional: first few asset thumbnails
}

const ShootItem = ({ shoot, onShare, thumbnailUrls }: ShootItemProps) => {
  const router = useRouter()
  
  const handleShare = () => {
    if (onShare) {
      onShare()
    }
  }

  const handleView = () => {
    router.push(`/studio/shoots/${shoot.id}`)
  }

  const handleEdit = () => {
    router.push(`/studio/edit-shoot?shootId=${shoot.id}`)
  }

  const displayThumbnails = thumbnailUrls && thumbnailUrls.length > 0 ? thumbnailUrls.slice(0, 4) : []

  return (
    <div className='col-flex gap-2 md:gap-4'>
        <h2>{shoot.title || 'Untitled Shoot'}</h2>

        {displayThumbnails.length > 0 ? (
          <div className='grid grid-cols-2 gap-4.5 md:gap-3.5'>
            {displayThumbnails.map((src, index) => (
              <Image 
                key={src}
                src={src} 
                alt={`${shoot.title || 'Shoot'} thumbnail ${index + 1}`} 
                width={300} 
                height={300}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={index < 2}
                className='w-full h-full object-cover border-2 rounded-lg border-foreground' 
              />
            ))}
          </div>
        ) : null}

        <div className='row-flex gap-2'>
          <Button className='bg-foreground text-background w-full p-3!' onClick={handleView}>
            View
          </Button>
          <Button className='border border-foreground text-foreground w-full p-3!' onClick={handleEdit}>
            Edit
          </Button>
          <Button className='border border-foreground text-foreground w-full p-3! row-flex gap-2 flex-centerize' onClick={handleShare}>
            <span>Share</span>
            <Image src={share} alt='share' width={20} height={20} className='h-4 w-auto' />
          </Button>
        </div>
    </div>
  )
}

export default React.memo(ShootItem)
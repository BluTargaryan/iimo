'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import downloadIcon from '@/app/assets/images/download.svg'
import closeIcon from '@/app/assets/images/close.svg'
import Button from './Button'

interface ImageGridItemProps {
  src?: string
  alt?: string
  onDelete?: () => void
}

const ImageGridItem = ({ src = 'https://images.unsplash.com/photo-1761839256547-0a1cd11b6dfb', alt = 'shoot-image', onDelete }: ImageGridItemProps) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOverlayOpen(true)
  }

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseOverlay()
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!src) return

    try {
      // Fetch the image
      const response = await fetch(src)
      const blob = await response.blob()
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob)
      
      // Extract filename from URL or use a default name
      const urlParts = src.split('/')
      const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg'
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading image:', error)
      // Fallback: open in new tab if download fails
      window.open(src, '_blank')
    }
  }

  // Close overlay on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOverlayOpen) {
        handleCloseOverlay()
      }
    }

    if (isOverlayOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOverlayOpen])

  return (
    <>
      <div className='relative h-fit rounded-lg overflow-hidden bg-foreground'>
        {/* Image placeholder - black rectangle */}
        <Image 
          src={src} 
          alt={alt} 
          width={300} 
          height={300}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className='w-full h-auto object-cover border-2 rounded-lg border-foreground' 
        />

        
        {/* White bar overlay at bottom with rounded ends */}
        <div className='absolute bottom-2 inset-x-2 h-5.5 flex gap-1 md:justify-between md:h-7'>
          <div className='row-flex gap-2 flex-1'>
          <Button 
            onClick={handleViewClick}
            className='bg-background border-2 border-foreground text-foreground flex-centerize flex-1 h-full p-1! text-xs md:flex-none md:w-36!'
          >
            View
          </Button>
          <Button 
            onClick={handleDownload}
            className='bg-background border-2 border-foreground flex-centerize w-5.5 md:w-7'
            aria-label='Download image'
          >
            <Image src={downloadIcon} alt='download' width={100} height={100} sizes="20px" className='w-2.5 h-auto' />
          </Button>
          </div>
          {onDelete && (
            <Button 
              onClick={onDelete}
              className='bg-background border-2 border-foreground flex-centerize w-5.5 md:w-7'
            >
              <Image src={closeIcon} alt='delete' width={100} height={100} sizes="20px" className='w-2.5 h-auto' />
            </Button>
          )}
        </div>
      </div>

      {/* Dark Image Overlay Modal */}
      {isOverlayOpen && (
        <div 
          className='fixed inset-0 z-50 bg-foreground/90 flex-centerize p-4'
          onClick={handleOverlayClick}
        >
          <div className='relative w-auto h-[90vh] rounded-lg overflow-hidden bg-background'>
            <button
              onClick={handleCloseOverlay}
              className='absolute top-4 right-4 z-10 w-8 h-8 flex-centerize bg-background border border-foreground rounded-full hover:opacity-70'
              aria-label='Close overlay'
            >
              <Image src={closeIcon} alt='close' width={100} height={100} sizes="20px" className='w-2.5 h-auto' />
            </button>
            <Image 
              src={src} 
              alt={alt} 
              width={800} 
              height={800}
              sizes="90vw"
              className='w-full h-full object-contain'
            />
          </div>
        </div>
      )}
    </>
  )
}

export default React.memo(ImageGridItem)


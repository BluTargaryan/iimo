'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import folderIcon from '@/app/assets/images/folder.svg'
import closeIcon from '@/app/assets/images/close.svg'
import Button from './Button'
import { compositeThumbnailOnPhoto } from '@/app/utils/imageCompositor'

interface ThumbnailUploadProps {
  onThumbnailChange?: (thumbnail: File | null) => void
  onCompositedImageChange?: (compositedFile: File | null) => void
  disabled?: boolean
  photos?: File[]
}

const ThumbnailUpload = ({ 
  onThumbnailChange, 
  disabled = false, 
  photos = [],
  onCompositedImageChange 
}: ThumbnailUploadProps) => {
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const compositedUrlRef = useRef<string | null>(null)

  const processThumbnailFile = async (file: File) => {
    // Check if file is PNG
    if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
      console.error('Only PNG files are allowed for thumbnails')
      return
    }

    // Set thumbnail regardless of photos
    setThumbnail(file)
    if (onThumbnailChange) {
      onThumbnailChange(file)
    }
    
    // Composite thumbnail on first photo if photos exist
    if (photos.length > 0) {
      try {
        const compositedFile = await compositeThumbnailOnPhoto(photos[0], file)
        if (onCompositedImageChange) {
          onCompositedImageChange(compositedFile)
        }
      } catch (error) {
        console.error('Failed to composite images:', error)
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processThumbnailFile(file)
    }
  }

  const handleRemoveThumbnail = () => {
    setThumbnail(null)
    setShowPreview(false)
    if (onThumbnailChange) {
      onThumbnailChange(null)
    }
  }

  const handleClickUpload = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) {
      return
    }

    const files = Array.from(e.dataTransfer.files)
    const pngFile = files.find(file => 
      file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
    )

    if (pngFile) {
      await processThumbnailFile(pngFile)
    } else if (files.length > 0) {
      console.error('Only PNG files are allowed for thumbnails')
    }
  }

  const [compositedImageUrl, setCompositedImageUrl] = useState<string | null>(null)

  // Effect to recomposite when photos or thumbnail changes
  useEffect(() => {
    if (thumbnail && photos.length > 0) {
      compositeThumbnailOnPhoto(photos[0], thumbnail)
        .then(file => {
          const url = URL.createObjectURL(file)
          if (compositedUrlRef.current) URL.revokeObjectURL(compositedUrlRef.current)
          compositedUrlRef.current = url
          setCompositedImageUrl(url)
          if (onCompositedImageChange) {
            onCompositedImageChange(file)
          }
        })
        .catch(console.error)
    } else {
      queueMicrotask(() => {
        if (compositedUrlRef.current) {
          URL.revokeObjectURL(compositedUrlRef.current)
          compositedUrlRef.current = null
        }
        setCompositedImageUrl(null)
      })
    }
    return () => {
      if (compositedUrlRef.current) {
        URL.revokeObjectURL(compositedUrlRef.current)
        compositedUrlRef.current = null
      }
    }
  }, [thumbnail, photos, onCompositedImageChange])

  return (
    <div className="col-flex gap-3.5 items-center">
      <label className={disabled ? 'opacity-50' : ''}>Add thumbnail</label>
      
      <div 
        className={`w-full ${disabled ? 'pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClickUpload}
          disabled={disabled}
          className={`w-full border border-foreground rounded-3xl p-3.5 flex items-center justify-between bg-background transition-all ${
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : isDragging
              ? 'border-2 border-foreground bg-foreground/5 cursor-pointer'
              : 'cursor-pointer hover:opacity-70'
          }`}
        >
          <span className={disabled ? 'text-placeholder' : 'text-foreground'}>
            {disabled 
              ? 'Add photos first' 
              : isDragging 
              ? 'Drop PNG file here' 
              : 'Click to add photo'}
          </span>
          <Image 
            src={folderIcon} 
            alt="folder" 
            width={20} 
            height={20}
            sizes="20px"
            className={`w-auto h-4 ${disabled ? 'opacity-50' : ''}`}
          />
        </button>
      </div>

      {thumbnail && (
        <>
          <div className="w-full row-flex gap-4.5 justify-end">
            <div className="relative w-24 h-24 rounded-lg shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URL */}
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail"
                className="w-full h-auto"
              />
              <button
                type="button"
                onClick={handleRemoveThumbnail}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background flex-centerize hover:opacity-70"
              >
                <Image src={closeIcon} alt="close" width={12} height={12} sizes="12px" className="w-3 h-3" />
              </button>
            </div>
            <Button
              type="button"
              onClick={() => photos.length > 0 && setShowPreview(!showPreview)}
              disabled={photos.length === 0}
              className={`w-full border border-foreground text-foreground px-4 py-2 self-start ${
                photos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              See preview
            </Button>
          </div>

          {showPreview && (
            <>
              {compositedImageUrl ? (
                <div className="relative w-full rounded-lg h-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob URL */}
                <img
                    src={compositedImageUrl}
                    alt="Composited preview"
                    className="w-full h-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background flex-centerize hover:opacity-70"
                  >
                    <Image src={closeIcon} alt="close" width={12} height={12} sizes="12px" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="relative w-full rounded-lg h-fit p-4 border border-foreground text-center">
                  <p className="text-foreground">Add photos first to see preview</p>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background flex-centerize hover:opacity-70"
                  >
                    <Image src={closeIcon} alt="close" width={12} height={12} sizes="12px" className="w-3 h-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ThumbnailUpload


'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import folderIcon from '@/app/assets/images/folder.svg'
import closeIcon from '@/app/assets/images/close.svg'

interface PhotoUploadGridProps {
  maxPhotos?: number
  onPhotosChange?: (photos: File[]) => void
}

interface PhotoWithId {
  file: File
  id: string
}

const PhotoUploadGrid = ({ maxPhotos = 6, onPhotosChange }: PhotoUploadGridProps) => {
  const [photos, setPhotos] = useState<PhotoWithId[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const remainingSlots = maxPhotos - photos.length
    const filesToAdd = imageFiles.slice(0, remainingSlots).map(file => ({
      file,
      id: `${file.name}-${file.size}-${file.lastModified}`
    }))
    
    const newPhotos = [...photos, ...filesToAdd]
    setPhotos(newPhotos)
    if (onPhotosChange) {
      onPhotosChange(newPhotos.map(p => p.file))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const handleRemovePhoto = (id: string) => {
    const newPhotos = photos.filter(p => p.id !== id)
    setPhotos(newPhotos)
    if (onPhotosChange) {
      onPhotosChange(newPhotos.map(p => p.file))
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (photos.length < maxPhotos) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (photos.length >= maxPhotos) {
      return
    }

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="col-flex gap-3.5 items-center justify-center">
      <label>Add photos</label>
      
      {canAddMore && (
        <div 
          className="w-full"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleClickUpload}
            className={`w-full border border-foreground rounded-3xl p-3.5 flex items-center justify-between cursor-pointer bg-background transition-all ${
              isDragging 
                ? 'border-2 border-foreground bg-foreground/5' 
                : 'hover:opacity-70'
            }`}
          >
            <span className="text-foreground">
              {isDragging ? 'Drop photos here' : 'Click to add photo'}
            </span>
            <Image src={folderIcon} alt="folder" width={20} height={20} sizes="20px" className="w-auto h-4" />
          </button>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-4.5 w-full">
          {photos.map((photoWithId, index) => {
            const blobUrl = URL.createObjectURL(photoWithId.file)
            return (
              <div key={photoWithId.id} className="relative rounded-lg h-fit">
                <img
                  src={blobUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-auto border-2 rounded-lg border-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photoWithId.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full border-2 border-foreground bg-background flex-centerize hover:opacity-70"
                >
                  <Image src={closeIcon} alt="close" width={12} height={12} sizes="12px" className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {photos.length > 0 && (
        <div className="w-full h-[0.5px] bg-foreground/30" />
      )}
    </div>
  )
}

export default PhotoUploadGrid


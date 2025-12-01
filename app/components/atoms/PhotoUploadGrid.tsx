'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import folderIcon from '@/app/assets/images/folder.svg'
import closeIcon from '@/app/assets/images/close.svg'

interface PhotoUploadGridProps {
  maxPhotos?: number
  onPhotosChange?: (photos: File[]) => void
}

const PhotoUploadGrid = ({ maxPhotos = 6, onPhotosChange }: PhotoUploadGridProps) => {
  const [photos, setPhotos] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const remainingSlots = maxPhotos - photos.length
    const filesToAdd = imageFiles.slice(0, remainingSlots)
    
    const newPhotos = [...photos, ...filesToAdd]
    setPhotos(newPhotos)
    if (onPhotosChange) {
      onPhotosChange(newPhotos)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    if (onPhotosChange) {
      onPhotosChange(newPhotos)
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
            <Image src={folderIcon} alt="folder" width={20} height={20} className="w-auto h-4" />
          </button>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-4.5 w-full">
          {photos.map((photo, index) => (
            <div key={index} className="relative rounded-lg h-fit">
              <Image
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-auto  border-2 rounded-lg border-foreground"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full border-2 border-foreground bg-background flex-centerize hover:opacity-70"
              >
                <Image src={closeIcon} alt="close" width={12} height={12} className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="w-full h-[0.5px] bg-foreground/30" />
      )}
    </div>
  )
}

export default PhotoUploadGrid


'use client'

import React, { useEffect } from 'react'
import Button from './Button'

interface ArchiveShootConfirmationModalProps {
  isVisible: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  isRestore?: boolean
}

const ArchiveShootConfirmationModal = ({ 
  isVisible, 
  onClose, 
  onConfirm,
  isLoading = false,
  isRestore = false
}: ArchiveShootConfirmationModalProps) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  if (!isVisible) return null

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div
      className='fixed inset-0 z-9999 bg-black/20 flex-centerize p-4'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className='w-full bg-background rounded-lg py-14 px-9 col-flex gap-7 max-w-md md:max-w-[400px] xl:max-w-[648px]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='col-flex gap-2 text-center'>
          <span>Are you sure you want to {isRestore ? 'unarchive' : 'archive'} this shoot?</span>
        </div>
        <div className='row-flex gap-2'>
          <Button
            className='bg-background text-foreground border border-foreground w-full p-3!'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className='bg-foreground text-background w-full p-3! border border-foreground'
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (isRestore ? 'Unarchiving...' : 'Archiving...') : (isRestore ? 'Yes, unarchive it' : 'Yes, archive it')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ArchiveShootConfirmationModal

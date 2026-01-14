'use client'

import React, { useEffect } from 'react'
import Button from './Button'

interface DeleteAssetConfirmationModalProps {
  isVisible: boolean
  onClose: () => void
  onConfirm: () => void
}

const DeleteAssetConfirmationModal = ({ isVisible, onClose, onConfirm }: DeleteAssetConfirmationModalProps) => {
  useEffect(() => {
    if (isVisible) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'unset'
    }

    // Cleanup: restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  if (!isVisible) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
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
        className='w-full bg-background rounded-lg py-14 px-9 col-flex gap-7 max-w-md'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='col-flex gap-2 text-center'>
          <span>Are you sure you want to delete this asset ?</span>
        </div>

        <div className='row-flex gap-2'>
          <Button 
            className='bg-background text-foreground border border-foreground w-full p-3!'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className='bg-foreground text-background w-full p-3! border border-foreground'
            onClick={handleConfirm}
          >
            Yes, delete it
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAssetConfirmationModal

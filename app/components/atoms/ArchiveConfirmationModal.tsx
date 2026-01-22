'use client'

import React, { useEffect } from 'react'
import Button from './Button'

interface ArchiveConfirmationModalProps {
  isVisible: boolean
  onClose: () => void
  clientId?: string
  onConfirm?: (clientId: string) => Promise<void>
  isLoading?: boolean
  isRestore?: boolean
}

const ArchiveConfirmationModal = ({ 
  isVisible, 
  onClose, 
  clientId, 
  onConfirm,
  isLoading = false,
  isRestore = false
}: ArchiveConfirmationModalProps) => {

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

  const handleConfirm = async () => {
    if (clientId && onConfirm) {
      await onConfirm(clientId)
    }
  }

  return (
    <div className='fixed inset-0 z-9999 bg-black/20 flex-centerize p-4'
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }}
    >

    <div className='w-full bg-background rounded-lg py-14 px-9 col-flex gap-7
    md:max-w-[400px]
    xl:max-w-[648px]
    '
    onClick={(e) => e.stopPropagation()}
    >
    <div className='col-flex gap-2 text-center'>
    <h2>{isRestore ? 'Restore Client' : 'Archive Client'}</h2>
    <span>Are you sure you want to {isRestore ? 'restore' : 'archive'} this client?</span>
    </div>

    <div className='row-flex gap-2'>
    <Button 
      className='border-2 border-foreground text-foreground w-full p-3!'
      onClick={onClose}
      disabled={isLoading}
    >
      Cancel
    </Button>
    <Button 
      className='bg-foreground text-background w-full p-3! border-2 border-foreground'
      onClick={handleConfirm}
      disabled={isLoading || !clientId}
    >
      {isLoading ? (isRestore ? 'Restoring...' : 'Archiving...') : (isRestore ? 'Restore' : 'Archive')}
    </Button>
    </div>
    </div>
        
    </div>
  )
}

export default ArchiveConfirmationModal
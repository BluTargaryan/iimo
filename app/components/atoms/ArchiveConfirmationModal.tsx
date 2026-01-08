'use client'

import React, { useEffect } from 'react'

interface ArchiveConfirmationModalProps {
  isVisible: boolean
  onClose: () => void
}

const ArchiveConfirmationModal = ({ isVisible, onClose }: ArchiveConfirmationModalProps) => {

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

  return (
    <div className='absolute inset-0 z-9999 bg-black/20'
    onClick={() => onClose()}
    >
        
    </div>
  )
}

export default ArchiveConfirmationModal
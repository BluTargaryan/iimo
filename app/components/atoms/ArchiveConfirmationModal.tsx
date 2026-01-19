'use client'

import React, { useEffect } from 'react'
import Button from './Button'

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
    <div className='fixed inset-0 z-9999 bg-black/20 flex-centerize p-4'
    onClick={() => onClose()}
    >

    <div className='w-full bg-background rounded-lg py-14 px-9 col-flex gap-7
    md:max-w-[400px]
    xl:max-w-[648px]
    '>
    <div className='col-flex gap-2 text-center'>
    <h2>Archive Client</h2>
    <span>Are you sure you want to archive this client?</span>
    </div>

    <div className='row-flex gap-2'>
    <Button className='border-2 border-foreground text-foreground w-full p-3!'>Cancel</Button>
    <Button className='bg-foreground text-background w-full p-3! border-2 border-foreground'>Archive</Button>
    </div>
    </div>
        
    </div>
  )
}

export default ArchiveConfirmationModal
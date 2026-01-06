'use client'

import React, { useEffect } from 'react'

interface ToastProps {
  isVisible: boolean
  onClose: () => void
}

const Toast = ({ isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div 
      className='fixed bottom-25 right-5 z-50 p-4 flex flex-centerize h-11 border-2 rounded-3xl bg-background cursor-pointer'
      onClick={onClose}
    >
      <span>Client link copied to dashboard.</span>
    </div>
  )
}

export default Toast
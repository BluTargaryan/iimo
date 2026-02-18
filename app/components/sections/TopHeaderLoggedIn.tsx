'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import logoutIcon from '@/app/assets/images/logout.svg'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUnreadNotificationCount } from '@/app/utils/notificationOperations'
import Link from 'next/link'

// Lazy load Notifications component (only loads when modal opens)
const Notifications = dynamic(() => import('./Notifications'), { ssr: false })

const TopHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const { signOut, user } = useAuth()
  const pathname = usePathname()
  
  const isShootsActive = pathname.startsWith('/studio/shoots')
  const isClientsActive = pathname.startsWith('/studio/clients')

  // Fetch unread notification count on mount and when user changes
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.id) {
        const { data } = await getUnreadNotificationCount(user.id)
        setUnreadCount(data ?? 0)
      }
    }
    loadUnreadCount()
  }, [user?.id])

  const handleNotifications = () => {
    const wasOpen = showNotifications
    setShowNotifications(!showNotifications)
    
    // Refresh count when closing modal
    if (wasOpen && user?.id) {
      getUnreadNotificationCount(user.id).then(({ data }) => {
        setUnreadCount(data ?? 0)
      })
    }
  }
  
  const handleNotificationRead = () => {
    // Refresh count when notification is marked as read
    if (user?.id) {
      getUnreadNotificationCount(user.id).then(({ data }) => {
        setUnreadCount(data ?? 0)
      })
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <>
    <header className="fixed top-0 inset-x-4 z-50 flex flex-col justify-between py-3 gap-2  border-b bg-background
    sm:items-center sm:h-16 sm:flex-row sm:py-0
    md:inset-x-10
    xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto xl:h-17
    ">
        <span className='font-black xl:text-xl'>iimo</span>

        <span className='row-flex font-normal gap-3 text-sm md:gap-5 md:text-base'>
            <Link 
              href="/studio/shoots" 
              className={`hover:underline ${isShootsActive ? 'underline' : ''}`}
            >
              Shoots
            </Link>
            <Link 
              href="/studio/clients" 
              className={`hover:underline ${isClientsActive ? 'underline' : ''}`}
            >
              Clients
            </Link>
        </span>

        <span className='row-flex font-normal gap-3 text-sm md:gap-5 md:text-base'>
            <span 
              onClick={handleNotifications} 
              className='hover:underline relative cursor-pointer'
            >
              Notifications
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-error text-background text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span className='row-flex gap-1 items-center cursor-pointer hover:underline' onClick={handleLogout}>
            <span className=''>Logout</span>
            <Image src={logoutIcon} alt="logout" width={20} height={20} className='w-3 h-auto'/>
            </span>
        </span>
    </header>
    {showNotifications && (
      <Notifications 
        onClose={() => setShowNotifications(false)} 
        onNotificationRead={handleNotificationRead}
      />
    )}
    </>
  )
}

export default TopHeader
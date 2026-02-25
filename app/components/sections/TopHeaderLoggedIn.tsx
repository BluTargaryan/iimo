'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import logoutIcon from '@/app/assets/images/logout.svg'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUnreadNotificationCount } from '@/app/utils/notificationOperations'
import Link from 'next/link'

const Notifications = dynamic(() => import('./Notifications'), { ssr: false })

interface TopHeaderLoggedInProps {
  userId: string
  initialUnreadCount: number
}

const TopHeader = ({ userId, initialUnreadCount }: TopHeaderLoggedInProps) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount)
  const { signOut } = useAuth()
  const pathname = usePathname()

  const isShootsActive = pathname.startsWith('/studio/shoots')
  const isClientsActive = pathname.startsWith('/studio/clients')

  const handleNotifications = () => {
    const wasOpen = showNotifications
    setShowNotifications(!showNotifications)

    if (wasOpen) {
      getUnreadNotificationCount(userId).then(({ data }) => {
        setUnreadCount(data ?? 0)
      })
    }
  }

  const handleNotificationRead = () => {
    getUnreadNotificationCount(userId).then(({ data }) => {
      setUnreadCount(data ?? 0)
    })
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
            <Image src={logoutIcon} alt="logout" width={20} height={20} sizes="20px" className='w-3 h-auto' />
          </span>
        </span>
      </header>
      {showNotifications && (
        <Notifications
          userId={userId}
          onClose={() => setShowNotifications(false)}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </>
  )
}

export default TopHeader

'use client'

import { useState } from 'react'
import Image from 'next/image'
import logoutIcon from '@/app/assets/images/logout.svg'
import Notifications from './Notifications'

const TopHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false)

  const handleNotifications = () => {
    setShowNotifications(!showNotifications)
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
            <span>Shoots</span>
            <span>Clients</span>
        </span>

        <span className='row-flex font-normal gap-3 text-sm md:gap-5 md:text-base'>
            <span onClick={handleNotifications}>Notifications</span>
            <span className='row-flex gap-1 items-center'>
            <span>Logout</span>
            <Image src={logoutIcon} alt="logout" width={20} height={20} className='w-3 h-auto'/>
            </span>
        </span>
    </header>
    {showNotifications && <Notifications />}
    </>
  )
}

export default TopHeader
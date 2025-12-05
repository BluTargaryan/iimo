import React from 'react'
import Image from 'next/image'
import logoutIcon from '@/app/assets/images/logout.svg'

const TopHeader = () => {
  return (
    <header className="fixed top-0 inset-x-4 z-50 flex justify-between  items-center h-16 border-b bg-background
    md:inset-x-10
    xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto xl:h-17
    ">
        <span className='font-black xl:text-xl'>iimo</span>

        <span className='row-flex font-normal gap-8'>
            <span>Title</span>
            <span className='row-flex gap-2 items-center'>
            <span>Logout</span>
            <Image src={logoutIcon} alt="logout" width={20} height={20} className='w-4 h-auto'/>
            </span>
        </span>
    </header>
  )
}

export default TopHeader
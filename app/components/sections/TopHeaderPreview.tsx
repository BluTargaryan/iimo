import React from 'react'

const TopHeaderPreview = () => {
  return (
    <header className="fixed top-0 inset-x-4 z-50 flex justify-between items-center h-16 border-b bg-background
    
    md:inset-x-10
    xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto xl:h-17
    ">
      <span className='font-black xl:text-xl'>iimo</span>
      <span>Preview link</span>
    </header>
  )
}

export default TopHeaderPreview


import React from 'react'
import Button from '../atoms/Button'

const AddShootFixed = () => {
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 p-4 flex flex-centerize  h-21 border-2 bg-background
    md:px-10
    xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto xl:bottom-8
    '>
        <Button
        className='bg-foreground text-background w-full p-3!
        xl:w-[662px] 
        '
        >
            <span>Add Client / Shoot</span>
        </Button>
    </nav>
  )
}

export default AddShootFixed
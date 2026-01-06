import React from 'react'
import Button from '../atoms/Button'

const AddShootClientFixed = () => {
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 p-4 flex flex-centerize  h-21 border-2 bg-background gap-5
    md:px-10
    xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto xl:bottom-8
    '>
        <Button
        className='bg-foreground text-background w-full p-3!
        xl:w-[662px] 
        '
        >
            <span>Add client</span>
        </Button>
        <Button
        className='bg-background text-foreground border border-foreground  w-full p-3!
        xl:w-[662px] 
        '
        >
            <span>Add shoot</span>
        </Button>
    </nav>
  )
}

export default AddShootClientFixed
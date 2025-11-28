import React from 'react'
import Button from '../atoms/Button'

const AddShootFixed = () => {
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 p-4 flex flex-centerize  h-21 border-2 bg-background'>
        <Button
        className='bg-foreground text-background w-full p-3!'
        >
            <span>Add Client / Shoot</span>
        </Button>
    </nav>
  )
}

export default AddShootFixed
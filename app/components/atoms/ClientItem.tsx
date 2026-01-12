import React from 'react'
import { useRouter } from 'next/navigation'
import Button from './Button'

interface ClientItemProps {
  onArchive?: () => void
  onNotes?: () => void
}

const ClientItem = ({ onArchive, onNotes }: ClientItemProps) => {
  const router = useRouter()

  const handleViewClick = () => {
    router.push('/studio/clients/1') // TODO: Replace with actual client ID
  }

  return (
    <div className='col-flex gap-4'>
        <div className='row-flex w-full justify-between items-center'>
        <h2>Client</h2>
        <Button 
          className='bg-background text-foreground border border-foreground px-3 py-1 text-xs'
          onClick={onArchive}
        >
            <span>Archive</span>
        </Button>
        </div>

        <div className='col-flex gap-1 text-xs'>
        <span>Email: email@example.com</span>
        <span>Created at: mm/dd/yyyy</span>
        </div>

        <div className='row-flex gap-2'>
            <Button 
              className='bg-foreground text-background w-full p-3!'
              onClick={handleViewClick}
            >
                <span>View</span>
            </Button>
            <Button className='bg-background text-foreground border border-foreground w-full p-3!'>
                <span>Edit</span>
            </Button>
            <Button 
              className='bg-background text-foreground border border-foreground w-full p-3!'
              onClick={onNotes}
            >
                <span>Notes</span>
            </Button>
        </div>
        
    </div>
  )
}

export default ClientItem
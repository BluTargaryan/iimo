'use client'

import React from 'react'
import Link from 'next/link'
import Button from './Button'
import { formatDateShort } from '@/app/utils/format'

interface ClientItemProps {
  id: string
  name: string
  email?: string
  createdAt: string
  status?: 'active' | 'archived'
  onArchive?: (id: string) => void
  onNotes?: (id: string) => void
}

const ClientItem = ({ id, name, email, createdAt, status = 'active', onArchive, onNotes }: ClientItemProps) => {
  return (
    <div className='col-flex gap-4'>
      <div className='row-flex w-full justify-between items-center'>
        <h2>{name}</h2>
        <Button
          className='bg-background text-foreground border border-foreground px-3 py-1 text-xs'
          onClick={() => onArchive?.(id)}
        >
          <span>{status === 'archived' ? 'Restore' : 'Archive'}</span>
        </Button>
      </div>

      <div className='col-flex gap-1 text-xs'>
        {email && <span>Email: {email}</span>}
        <span>Created at: {formatDateShort(createdAt)}</span>
      </div>

      <div className='row-flex gap-2'>
        <Link href={`/studio/clients/${id}`} className='w-full'>
          <Button className='bg-foreground text-background w-full p-3!'>
            <span>View</span>
          </Button>
        </Link>
        <Link href={`/studio/clients/${id}/edit`} className='w-full'>
          <Button className='bg-background text-foreground border border-foreground w-full p-3!'>
            <span>Edit</span>
          </Button>
        </Link>
        <Button
          className='bg-background text-foreground border border-foreground w-full p-3!'
          onClick={() => onNotes?.(id)}
        >
          <span>Notes</span>
        </Button>
      </div>
    </div>
  )
}

export default React.memo(ClientItem)

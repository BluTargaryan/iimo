'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/app/utils/clientOperations'
import Button from '@/app/components/atoms/Button'
import TextInput from '@/app/components/atoms/TextInput'

const AddClientPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.target
    if (fieldName === 'name') {
      setName(value)
    } else if (fieldName === 'email') {
      setEmail(value)
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!name.trim()) {
      setError('Client name is required')
      return
    }

    if (!user?.id) {
      setError('You must be logged in to add a client')
      return
    }

    setLoading(true)

    const { error: createError } = await createClient(user.id, {
      name: name.trim(),
      email: email.trim() || undefined,
    })

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    // Redirect to clients list on success
    router.push('/studio/clients')
  }

  const handleCancel = () => {
    router.push('/studio/clients')
  }

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
       <div className="col-flex items-center gap-4 mb-28">
        <h1 className="text-center">Add client</h1>
        {error && <span className="text-error">{error}</span>}
      </div>

      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <TextInput
          id='name'
          name='name'
          type='text'
          label='Client name'
          placeholder='Enter client name'
          value={name}
          onChange={handleInputChange}
        />

        <TextInput
          id='email'
          name='email'
          type='email'
          label='Email (Optional)'
          placeholder='Enter email address'
          value={email}
          onChange={handleInputChange}
        />
      </div>

      <div className="w-full col-flex gap-3.5">
        <Button
          type='submit'
          className='bg-foreground text-background w-full p-3.5'
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add client'}
        </Button>
        <Button
          type='button'
          className='border-2 border-foreground text-foreground w-full p-3.5'
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default AddClientPage

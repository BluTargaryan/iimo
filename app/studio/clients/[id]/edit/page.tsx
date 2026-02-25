'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchClientById, updateClient, type Client } from '@/app/utils/clientOperations'
import Button from '@/app/components/atoms/Button'
import TextInput from '@/app/components/atoms/TextInput'

interface EditClientPageProps {
  params: Promise<{
    id: string
  }>
}

const EditClientPage = ({ params }: EditClientPageProps) => {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch client data on mount
  useEffect(() => {
    const loadClient = async () => {
      setLoading(true)
      setError(null)

      const { data: clientData, error: clientError } = await fetchClientById(id)
      if (clientError || !clientData) {
        setError(clientError?.message || 'Client not found')
        setLoading(false)
        return
      }

      setName(clientData.name)
      setEmail(clientData.email || '')
      setLoading(false)
    }

    loadClient()
  }, [id])

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
      setError('You must be logged in to edit a client')
      return
    }

    setSaving(true)

    const { data, error: updateError } = await updateClient(id, {
      name: name.trim(),
      email: email.trim() || undefined,
    })

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // Redirect to client detail page on success
    router.push(`/studio/clients/${id}`)
  }

  const handleCancel = () => {
    router.push(`/studio/clients/${id}`)
  }

  if (loading) {
    return (
      <form className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
        <div className="col-flex items-center gap-4 mb-28">
          <h1>Edit client</h1>
          <p>Loading...</p>
        </div>
      </form>
    )
  }

  if (error && !name) {
    return (
      <form className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
        <div className="col-flex items-center gap-4 mb-28">
          <h1>Edit client</h1>
          <span className="text-error">{error}</span>
          <Button
            type="button"
            className="border-2 border-foreground text-foreground w-full p-3.5"
            onClick={() => router.push('/studio/clients')}
          >
            Back to Clients
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
      <div className="col-flex items-center gap-4 mb-28">
        <h1 className="text-center">Edit client</h1>
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
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
        <Button
          type='button'
          className='border-2 border-foreground text-foreground w-full p-3.5'
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default EditClientPage

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchClients, type Client } from '@/app/utils/clientOperations'
import { fetchShootById, updateShoot } from '@/app/utils/shootOperations'
import TextInput from '@/app/components/atoms/TextInput'
import Select from '@/app/components/atoms/Select'
import DateInput from '@/app/components/atoms/DateInput'
import Button from '@/app/components/atoms/Button'

const EditShootPage = () => {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shootId = searchParams.get('shootId')

  const [formData, setFormData] = useState({
    title: '',
    client: '', // Now stores client ID
    shootDate: ''
  })
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id || !shootId) {
      if (!shootId) setError('Shoot ID is required')
      setFetching(false)
      return
    }

    const loadData = async () => {
      setFetching(true)
      setError(null)

      const [shootResult, clientsResult] = await Promise.all([
        fetchShootById(shootId),
        fetchClients(user.id)
      ])

      if (clientsResult.error) {
        setError(clientsResult.error.message)
        setFetching(false)
        return
      }
      const clientsData = clientsResult.data || []
      setClients(clientsData)

      if (shootResult.error || !shootResult.data) {
        setError(shootResult.error?.message || 'Shoot not found')
        setFetching(false)
        return
      }

      const shoot = shootResult.data
      const matchingClient = clientsData.find(c => c.id === shoot.client_id)

      setFormData({
        title: shoot.title || '',
        client: shoot.client_id || '',
        shootDate: shoot.shoot_date || ''
      })
      setFetching(false)
    }

    loadData()
  }, [user?.id, shootId])

  // Create unique options by ID (in case of duplicate names)
  const uniqueClients = Array.from(
    new Map(clients.map(client => [client.id, client])).values()
  )
  const clientOptions = uniqueClients.map(client => ({
    value: client.id,
    label: client.name
  }))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!shootId) {
      setError('Shoot ID is required')
      return
    }

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.client) {
      setError('Client is required')
      return
    }

    if (!formData.shootDate) {
      setError('Shoot date is required')
      return
    }

    // Validate client ID
    const selectedClient = clients.find(c => c.id === formData.client)
    if (!selectedClient) {
      setError('Invalid client selected')
      return
    }

    setLoading(true)

    try {
      const { data: updatedShoot, error: updateError } = await updateShoot(shootId, {
        title: formData.title.trim(),
        client_id: formData.client,
        shoot_date: formData.shootDate || undefined
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      if (updatedShoot) {
        router.push(`/studio/shoots/${updatedShoot.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shoot')
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (shootId) {
      router.push(`/studio/shoots/${shootId}`)
    } else {
      router.push('/studio/shoots')
    }
  }

  if (fetching) {
    return (
      <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
        <div className='col-flex items-center justify-center py-12'>
          <span>Loading shoot...</span>
        </div>
      </main>
    )
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>Edit shoot</h1>

      {error && (
        <div className='w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='w-full col-flex gap-6'>
        <div className="col-flex gap-6 mb-15">
          <TextInput
            id="title"
            name="title"
            type="text"
            label="Title of shoot"
            placeholder="Enter the title"
            value={formData.title}
            onChange={handleInputChange}
          />

          <Select
            id="client"
            name="client"
            label="Client"
            placeholder="Pick an option"
            options={clientOptions}
            value={formData.client}
            onChange={handleInputChange}
          />

          <DateInput
            id="shootDate"
            name="shootDate"
            label="Shoot date"
            placeholder="dd/mm/yy"
            value={formData.shootDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-flex gap-4">
          <Button
            type="submit"
            className='bg-foreground text-background w-full p-3.5'
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update shoot'}
          </Button>
          <Button
            type="button"
            className='bg-background text-foreground border border-foreground w-full p-3.5'
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}

export default EditShootPage

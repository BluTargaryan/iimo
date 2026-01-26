'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchClients, type Client } from '@/app/utils/clientOperations'
import { createShoot } from '@/app/utils/shootOperations'
import TextInput from '@/app/components/atoms/TextInput'
import Select from '@/app/components/atoms/Select'
import DateInput from '@/app/components/atoms/DateInput'
import FileInput from '@/app/components/atoms/FileInput'
import Button from '@/app/components/atoms/Button'
import Toast from '@/app/components/sections/Toast'

const AddShootPage = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    shootDate: '',
    contract: null as File | null
  })
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!user?.id) return

    const loadClients = async () => {
      const { data, error: fetchError } = await fetchClients(user.id, 'active')
      
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setClients(data || [])
      }
    }

    loadClients()
  }, [user?.id])

  const clientOptions = clients.map(client => client.name)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        contract: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Form validation
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

    // Find client ID from selected client name
    const selectedClient = clients.find(c => c.name === formData.client)
    if (!selectedClient) {
      setError('Invalid client selected')
      return
    }

    setLoading(true)

    try {
      if (!user?.id) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const { data: newShoot, error: createError } = await createShoot({
        user_id: user.id,
        client_id: selectedClient.id,
        title: formData.title.trim(),
        shoot_date: formData.shootDate || undefined,
        status: 'active', // Default status for new shoots
      })

      if (createError) {
        setError(createError.message)
        setLoading(false)
        return
      }

      setToastMessage('Shoot created successfully!')
      setShowToast(true)
      
      // Navigate to shoot details page
      if (newShoot) {
        setTimeout(() => {
          router.push(`/studio/shoots/${newShoot.id}`)
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shoot')
      setLoading(false)
    }
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>Add shoot</h1>

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

        {/* <FileInput
          id="contract"
          name="contract"
          label="Contract (optional)"
          placeholder="Select a file (pdf)"
          accept=".pdf"
          onChange={handleFileChange}
        /> */}
        </div>

        <Button 
          type="submit" 
          className='bg-foreground text-background w-full p-3.5'
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Complete registration'}
        </Button>
      </form>
      <Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default AddShootPage


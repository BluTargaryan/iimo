'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createUsageRights } from '@/app/utils/usageRightsOperations'
import Select from '@/app/components/atoms/Select'
import DateInput from '@/app/components/atoms/DateInput'
import Textarea from '@/app/components/atoms/Textarea'
import FileInput from '@/app/components/atoms/FileInput'
import Button from '@/app/components/atoms/Button'
import Toast from '@/app/components/sections/Toast'

const AddRightsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shootId = searchParams.get('shootId')
  const assetId = searchParams.get('assetId')

  const [formData, setFormData] = useState({
    usage: '',
    startDate: '',
    endDate: '',
    restrictions: '',
    contract: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const usageOptions = ['Option 1', 'Option 2', 'Option 3', 'Other'] // TODO: Replace with actual options

  useEffect(() => {
    if (!shootId) {
      setError('Shoot ID is required')
    }
  }, [shootId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // Validate file type
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed for contracts')
        return
      }
      setFormData(prev => ({
        ...prev,
        contract: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!shootId) {
      setError('Shoot ID is required')
      return
    }

    // Form validation
    if (!formData.usage) {
      setError('Usage type is required')
      return
    }

    if (!formData.startDate) {
      setError('Start date is required')
      return
    }

    if (!formData.endDate) {
      setError('End date is required')
      return
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        setError('End date must be after start date')
        return
      }
    }

    setLoading(true)

    try {
      const { data: newRights, error: createError } = await createUsageRights(shootId, {
        usage_type: formData.usage,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        restrictions: formData.restrictions || null,
        contract: formData.contract,
      })

      if (createError) {
        setError(createError.message)
        setLoading(false)
        return
      }

      setToastMessage('Usage rights created successfully!')
      setShowToast(true)

      // Navigate back to shoot details page
      setTimeout(() => {
        router.push(`/studio/shoots/${shootId}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create usage rights')
      setLoading(false)
    }
  }

  const handleDoLater = () => {
    if (shootId) {
      router.push(`/studio/shoots/${shootId}`)
    } else {
      router.back()
    }
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>User rights</h1>

      {error && (
        <div className='w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='w-full col-flex gap-6'>
        <div className="col-flex gap-6 mb-15">
          <Select
            id="usage"
            name="usage"
            label="Usage"
            placeholder="Pick an option"
            options={usageOptions}
            value={formData.usage}
            onChange={handleInputChange}
          />

          <DateInput
            id="startDate"
            name="startDate"
            label="Start date"
            placeholder="dd/mm/yy"
            value={formData.startDate}
            onChange={handleInputChange}
          />

          <DateInput
            id="endDate"
            name="endDate"
            label="End date"
            placeholder="dd/mm/yy"
            value={formData.endDate}
            onChange={handleInputChange}
          />

          <Textarea
            id="restrictions"
            name="restrictions"
            label="Restrictions (optional)"
            placeholder="Type in the restrictions"
            value={formData.restrictions}
            onChange={handleInputChange}
            rows={4}
          />

          <FileInput
            id="contract"
            name="contract"
            label="Contract (optional)"
            placeholder="Select a file (pdf)"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>

        <div className="col-flex gap-4">
          <Button 
            type="submit" 
            className='bg-foreground text-background w-full p-3.5'
            disabled={loading || !shootId}
          >
            {loading ? 'Creating...' : 'Setup rights'}
          </Button>
          <Button 
            type="button" 
            className='bg-background text-foreground border border-foreground w-full p-3.5'
            onClick={handleDoLater}
            disabled={loading}
          >
            Do this later
          </Button>
        </div>
      </form>
      <Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default AddRightsPage

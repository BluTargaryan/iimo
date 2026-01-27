'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createUsageRights } from '@/app/utils/usageRightsOperations'
import MultiSelect from '@/app/components/atoms/MultiSelect'
import TextInput from '@/app/components/atoms/TextInput'
import DateInput from '@/app/components/atoms/DateInput'
import Textarea from '@/app/components/atoms/Textarea'
import FileInput from '@/app/components/atoms/FileInput'
import Button from '@/app/components/atoms/Button'

const AddRightsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shootId = searchParams.get('shootId')
  const assetId = searchParams.get('assetId')

  const [formData, setFormData] = useState({
    usage: [] as string[],
    otherUsageText: '',
    startDate: '',
    endDate: '',
    restrictions: '',
    contract: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usageOptions = [
    'Editorial',
    'Commercial',
    'Social Media',
    'Print',
    'Web/Digital',
    'Unlimited',
    'Other'
  ]

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

  const handleUsageChange = (selectedValues: string[]) => {
    setFormData(prev => ({
      ...prev,
      usage: selectedValues
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
    if (formData.usage.length === 0) {
      setError('At least one usage type is required')
      return
    }

    // If "Other" is selected, require otherUsageText
    if (formData.usage.includes('Other') && !formData.otherUsageText.trim()) {
      setError('Please specify the custom usage type')
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
      // Upload contract once if provided (will be reused for all records)
      let contractUrl: string | null = null
      if (formData.contract) {
        const { uploadContract } = await import('@/app/utils/usageRightsOperations')
        const { data: uploadedUrl, error: uploadError } = await uploadContract(shootId, formData.contract)
        if (uploadError) {
          setError(uploadError.message)
          setLoading(false)
          return
        }
        contractUrl = uploadedUrl
      }

      // Prepare usage types array (one per selected option)
      const usageTypes: string[] = []
      formData.usage.forEach(opt => {
        if (opt !== 'Other') {
          usageTypes.push(opt)
        } else if (formData.otherUsageText.trim()) {
          usageTypes.push(formData.otherUsageText.trim())
        }
      })

      // Create a record for each usage type using createUsageRights (which handles ownership verification)
      const createPromises = usageTypes.map(usageType =>
        createUsageRights(shootId, {
          usage_type: usageType,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          restrictions: formData.restrictions || null,
          contract: null, // We'll update with the URL after creation
        })
      )

      const results = await Promise.all(createPromises)
      const errors = results.filter(r => r.error)
      
      if (errors.length > 0) {
        // Clean up uploaded contract if any creation fails
        if (contractUrl) {
          const { supabase } = await import('@/app/utils/supabase')
          const urlParts = contractUrl.split('/contracts/')
          if (urlParts.length > 1) {
            const filePath = `shoots/${shootId}/contracts/${urlParts[1]}`
            await supabase.storage.from('contracts').remove([filePath])
          }
        }
        setError(errors[0].error?.message || 'Failed to create some usage rights')
        setLoading(false)
        return
      }

      // Update all created records with the contract URL if one was uploaded
      if (contractUrl && results.length > 0) {
        const { supabase } = await import('@/app/utils/supabase')
        const createdIds = results.filter(r => r.data).map(r => r.data!.id)
        
        if (createdIds.length > 0) {
          const { error: updateError } = await supabase
            .from('usage_rights')
            .update({ contract: contractUrl })
            .in('id', createdIds)

          if (updateError) {
            console.error('Error updating contract URL:', updateError)
            // Don't fail the whole operation if contract update fails
          }
        }
      }

      // Navigate back to shoot details page
      router.push(`/studio/shoots/${shootId}`)
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
          <MultiSelect
            id="usage"
            name="usage"
            label="Usage"
            placeholder="Pick options"
            options={usageOptions}
            value={formData.usage}
            onChange={handleUsageChange}
          />

          {formData.usage.includes('Other') && (
            <TextInput
              id="otherUsageText"
              name="otherUsageText"
              type="text"
              label="Specify custom usage type"
              placeholder="Enter custom usage type"
              value={formData.otherUsageText}
              onChange={handleInputChange}
            />
          )}

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
    </main>
  )
}

export default AddRightsPage

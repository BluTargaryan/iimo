'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchUsageRights, updateUsageRights } from '@/app/utils/usageRightsOperations'
import MultiSelect from '@/app/components/atoms/MultiSelect'
import TextInput from '@/app/components/atoms/TextInput'
import DateInput from '@/app/components/atoms/DateInput'
import Textarea from '@/app/components/atoms/Textarea'
import FileInput from '@/app/components/atoms/FileInput'
import PDFViewer from '@/app/components/atoms/PDFViewer'
import Button from '@/app/components/atoms/Button'

const EditRightsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shootId = searchParams.get('shootId')
  const rightsId = searchParams.get('rightsId')

  const [formData, setFormData] = useState({
    usage: [] as string[],
    otherUsageText: '',
    startDate: '',
    endDate: '',
    restrictions: '',
    contract: null as File | null
  })
  const [existingContractUrl, setExistingContractUrl] = useState<string | null>(null)
  const [newContractPreviewUrl, setNewContractPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  // Fetch existing usage rights data
  useEffect(() => {
    if (!shootId || !rightsId) {
      setError('Shoot ID and Rights ID are required')
      setFetching(false)
      return
    }

    const loadUsageRights = async () => {
      setFetching(true)
      setError(null)
      const { data, error: fetchError } = await fetchUsageRights(shootId)
      
      if (fetchError) {
        setError(fetchError.message)
        setFetching(false)
        return
      }

      const rights = data?.find(r => r.id === rightsId)
      if (!rights) {
        setError('Usage rights not found')
        setFetching(false)
        return
      }

      // Pre-populate form with existing data
      const usageTypes = rights.usage_types || []
      const standardOptions: string[] = []
      let otherText = ''

      usageTypes.forEach(type => {
        if (usageOptions.includes(type)) {
          standardOptions.push(type)
        } else {
          otherText = type
        }
      })

      setFormData({
        usage: otherText ? [...standardOptions, 'Other'] : standardOptions,
        otherUsageText: otherText,
        startDate: rights.start_date || '',
        endDate: rights.end_date || '',
        restrictions: rights.restrictions || '',
        contract: null // Don't pre-populate file input
      })
      setExistingContractUrl(rights.contract || null)
      setFetching(false)
    }

    loadUsageRights()
  }, [shootId, rightsId])

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
      
      // Clean up previous preview URL if exists
      if (newContractPreviewUrl) {
        URL.revokeObjectURL(newContractPreviewUrl)
      }
      
      // Create preview URL for the new file
      const previewUrl = URL.createObjectURL(file)
      setNewContractPreviewUrl(previewUrl)
      
      setFormData(prev => ({
        ...prev,
        contract: file
      }))
    } else {
      // Clean up preview URL if file is removed
      if (newContractPreviewUrl) {
        URL.revokeObjectURL(newContractPreviewUrl)
        setNewContractPreviewUrl(null)
      }
    }
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (newContractPreviewUrl) {
        URL.revokeObjectURL(newContractPreviewUrl)
      }
    }
  }, [newContractPreviewUrl])

  const handleDiscardNewContract = () => {
    // Clean up preview URL
    if (newContractPreviewUrl) {
      URL.revokeObjectURL(newContractPreviewUrl)
      setNewContractPreviewUrl(null)
    }
    
    // Clear the contract from form data
    setFormData(prev => ({
      ...prev,
      contract: null
    }))
    
    // Reset the file input
    const fileInput = document.getElementById('contract') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!shootId || !rightsId) {
      setError('Shoot ID and Rights ID are required')
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
      // Prepare usage types array from selected options
      const usageTypes: string[] = []
      formData.usage.forEach(opt => {
        if (opt !== 'Other') {
          usageTypes.push(opt)
        } else if (formData.otherUsageText.trim()) {
          usageTypes.push(formData.otherUsageText.trim())
        }
      })

      // Update usage rights record
      const { data: updatedRights, error: updateError } = await updateUsageRights(rightsId, {
        usage_types: usageTypes,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        restrictions: formData.restrictions || null,
        contract: formData.contract,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      // Navigate back to shoot details page
      router.push(`/studio/shoots/${shootId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update usage rights')
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (shootId) {
      router.push(`/studio/shoots/${shootId}`)
    } else {
      router.back()
    }
  }

  if (fetching) {
    return (
      <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
        <div className='col-flex items-center justify-center py-12'>
          <span>Loading usage rights...</span>
        </div>
      </main>
    )
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>Edit User rights</h1>

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

          <div className="col-flex gap-3.5">
            {existingContractUrl && !formData.contract && (
              <div className="w-full">
                <p className="text-sm mb-2 text-placeholder">Current contract:</p>
                <div className="mb-8">
                  <PDFViewer src={existingContractUrl} title="Contract PDF Viewer" />
                </div>
              </div>
            )}
            {formData.contract && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-foreground font-semibold">
                    {existingContractUrl ? 'New contract (will replace existing):' : 'New contract:'}
                  </p>
                  <button
                    type="button"
                    onClick={handleDiscardNewContract}
                    className="text-sm text-red-600 hover:opacity-70 underline"
                  >
                    Discard
                  </button>
                </div>
                {newContractPreviewUrl && (
                  <div className="mb-8">
                    <PDFViewer src={newContractPreviewUrl} title="New Contract PDF Preview" />
                  </div>
                )}
                <p className="text-sm text-placeholder mb-2">
                  Selected: {formData.contract.name}
                </p>
              </div>
            )}
            <FileInput
              id="contract"
              name="contract"
              label="Contract (optional)"
              placeholder="Select a file (pdf)"
              accept=".pdf"
              value={formData.contract?.name || ''}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="col-flex gap-4">
          <Button 
            type="submit" 
            className='bg-foreground text-background w-full p-3.5'
            disabled={loading || !shootId || !rightsId}
          >
            {loading ? 'Updating...' : 'Update rights'}
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

export default EditRightsPage

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Select from '@/app/components/atoms/Select'
import DateInput from '@/app/components/atoms/DateInput'
import Textarea from '@/app/components/atoms/Textarea'
import FileInput from '@/app/components/atoms/FileInput'
import Button from '@/app/components/atoms/Button'

const AddRightsPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    usage: '',
    startDate: '',
    endDate: '',
    restrictions: '',
    contract: null as File | null
  })

  const usageOptions = ['Option 1', 'Option 2', 'Option 3', 'Other'] // Replace with actual options

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    // TODO: Implement rights setup functionality
  }

  const handleDoLater = () => {
    // Navigate back or close
    router.back()
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]'>
      <h1 className='mb-28'>User rights</h1>

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
          <Button type="submit" className='bg-foreground text-background w-full p-3.5'>
            Setup rights
          </Button>
          <Button 
            type="button" 
            className='bg-background text-foreground border border-foreground w-full p-3.5'
            onClick={handleDoLater}
          >
            Do this later
          </Button>
        </div>
      </form>
    </main>
  )
}

export default AddRightsPage

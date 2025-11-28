'use client'

import React, { useState } from 'react'
import TextInput from '@/app/components/atoms/TextInput'
import Select from '@/app/components/atoms/Select'
import DateInput from '@/app/components/atoms/DateInput'
import FileInput from '@/app/components/atoms/FileInput'
import Button from '@/app/components/atoms/Button'

const AddShootPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    usage: '',
    other: '',
    expiryDate: '',
    contract: null as File | null
  })

  const usageOptions = ['Option 1', 'Option 2', 'Option 3', 'Other'] // Replace with actual options

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  }

  return (
    <main className='col-flex items-center max-w-[270px] mx-auto'>
      <h1 className='mb-28'>Add client/shoot</h1>

      <form onSubmit={handleSubmit} className='w-full col-flex gap-6'>
      <div className="col-flex gap-6 mb-15">
        <TextInput
          id="title"
          name="title"
          type="text"
          label="Title of client / shoot"
          placeholder="Enter the title"
          value={formData.title}
          onChange={handleInputChange}
        />

        <Select
          id="usage"
          name="usage"
          label="Usage"
          placeholder="Pick an option"
          options={usageOptions}
          value={formData.usage}
          onChange={handleInputChange}
        />

        {formData.usage === 'Other' && (
          <TextInput
            id="other"
            name="other"
            type="text"
            label="Other"
            placeholder="Type in the usage"
            value={formData.other}
            onChange={handleInputChange}
          />
        )}

        <DateInput
          id="expiryDate"
          name="expiryDate"
          label="Expiry date"
          placeholder="dd/mm/yy"
          value={formData.expiryDate}
          onChange={handleInputChange}
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

        <Button type="submit" className='bg-foreground text-background w-full p-3.5'>
          Complete registration
        </Button>
      </form>
    </main>
  )
}

export default AddShootPage


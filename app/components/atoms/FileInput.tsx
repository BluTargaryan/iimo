'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import folderIcon from '@/app/assets/images/folder.svg'

interface FileInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  accept?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FileInput = ({ id, name, label, placeholder = 'Select a file (pdf)', accept = '.pdf', value, onChange }: FileInputProps) => {
  const [fileName, setFileName] = useState<string>(value || '')

  useEffect(() => {
    setFileName(value || '')
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    } else {
      setFileName('')
    }
    if (onChange) {
      onChange(e)
    }
  }

  return (
    <div className="col-flex gap-3.5 items-center">
      <label htmlFor={id}>{label}</label>
      <div className="relative w-full">
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor={id}
          className="w-full border border-foreground rounded-3xl p-3.5 flex items-center justify-between cursor-pointer hover:opacity-70 bg-background"
        >
          <span className={fileName ? 'text-foreground' : 'text-placeholder'}>
            {fileName || placeholder}
          </span>
          <Image src={folderIcon} alt="folder" width={20} height={20} sizes="20px" className="w-auto h-4" />
        </label>
      </div>
    </div>
  )
}

export default FileInput


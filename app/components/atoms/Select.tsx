'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import dropdownArrow from '@/app/assets/images/dropdownArrow.svg'

interface SelectProps {
  id: string
  name: string
  label: string
  placeholder?: string
  options?: string[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const Select = ({ id, name, label, placeholder = 'Pick an option', options = [], value, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedValue(value || '')
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleOptionClick = (option: string) => {
    setSelectedValue(option)
    setIsOpen(false)
    
    // Create a synthetic event to match the onChange signature
    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          value: option
        }
      } as React.ChangeEvent<HTMLSelectElement>
      onChange(syntheticEvent)
    }
  }

  const displayValue = selectedValue || placeholder

  return (
    <div className="col-flex gap-3.5 items-center">
      <label htmlFor={id}>{label}</label>
      <div className="relative w-full" ref={dropdownRef}>
        {/* Selected Option Display */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border border-foreground rounded-3xl p-3.5 flex items-center justify-between cursor-pointer bg-background ${
            isOpen ? 'rounded-b-none border-b-0' : ''
          }`}
        >
          <span className={`text-center flex-1 ${selectedValue ? 'text-foreground' : 'text-placeholder'}`}>
            {displayValue}
          </span>
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <Image src={dropdownArrow} alt="dropdown arrow" width={12} height={8} className="w-3 h-2" />
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-20 bg-background border border-foreground border-t-0 rounded-b-3xl overflow-hidden shadow-lg">
            {options.map((option, index) => (
              <React.Fragment key={option}>
                {index > 0 && (
                  <div className="h-[0.5px] bg-foreground/20" />
                )}
                <div
                  onClick={() => handleOptionClick(option)}
                  className={`p-3.5 text-center cursor-pointer hover:bg-foreground/5 transition-colors ${
                    selectedValue === option ? 'bg-foreground/10' : ''
                  }`}
                >
                  {option}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Select


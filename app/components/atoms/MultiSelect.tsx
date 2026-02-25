'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import dropdownArrow from '@/app/assets/images/dropdownArrow.svg'
import closeIcon from '@/app/assets/images/close.svg'

interface MultiSelectProps {
  id: string
  name: string
  label: string
  placeholder?: string
  options?: string[]
  value?: string[]
  onChange?: (selectedValues: string[]) => void
}

const MultiSelect = ({
  id,
  name,
  label,
  placeholder = 'Pick options',
  options = [],
  value = [],
  onChange
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>(value || [])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayValues = value ?? selectedValues

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
    const newSelectedValues = displayValues.includes(option)
      ? displayValues.filter(v => v !== option)
      : [...displayValues, option]

    setSelectedValues(newSelectedValues)
    onChange?.(newSelectedValues)
  }

  const handleRemoveOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelectedValues = displayValues.filter(v => v !== option)
    setSelectedValues(newSelectedValues)
    onChange?.(newSelectedValues)
  }

  const displayValue = displayValues.length > 0 
    ? `${displayValues.length} selected` 
    : placeholder

  return (
    <div className="col-flex gap-3.5 items-center">
      <input type="hidden" name={name} value={JSON.stringify(displayValues)} readOnly aria-hidden />
      <label htmlFor={id}>{label}</label>
      <div className="relative w-full" ref={dropdownRef}>
        {/* Selected Options Display */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border border-foreground rounded-3xl p-3.5 flex items-center justify-between cursor-pointer bg-background min-h-[48px] ${
            isOpen ? 'rounded-b-none border-b-0' : ''
          }`}
        >
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            {displayValues.length > 0 ? (
              displayValues.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-foreground/10 rounded-md text-sm"
                >
                  {val}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(val, e)}
                    className="hover:bg-foreground/20 rounded p-0.5"
                  >
                    <Image src={closeIcon} alt="remove" width={12} height={12} sizes="12px" className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className={`text-center flex-1 ${displayValues.length > 0 ? 'text-foreground' : 'text-placeholder'}`}>
                {displayValue}
              </span>
            )}
          </div>
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <Image src={dropdownArrow} alt="dropdown arrow" width={12} height={8} sizes="12px" className="w-3 h-2" />
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-20 bg-background border border-foreground border-t-0 rounded-b-3xl overflow-hidden shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <React.Fragment key={option}>
                {index > 0 && (
                  <div className="h-[0.5px] bg-foreground/20" />
                )}
                <div
                  onClick={() => handleOptionClick(option)}
                  className={`p-3.5 text-center cursor-pointer hover:bg-foreground/5 transition-colors flex items-center justify-between ${
                    displayValues.includes(option) ? 'bg-foreground/10' : ''
                  }`}
                >
                  <span>{option}</span>
                  {displayValues.includes(option) && (
                    <span className="text-foreground font-bold">✓</span>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiSelect

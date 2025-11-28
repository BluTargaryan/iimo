import React from 'react'

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
  return (
    <div className="col-flex gap-3.5 items-center">
      <label htmlFor={id}>{label}</label>
      <div className="relative w-full">
        <select
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full border border-foreground rounded-3xl p-3.5 text-center appearance-none bg-background cursor-pointer focus:outline-none"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Select


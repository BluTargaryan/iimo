import React from 'react'

interface DateInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const DateInput = ({ id, name, label, placeholder = 'dd/mm/yy', value, onChange }: DateInputProps) => {
  return (
    <div className="col-flex gap-3.5 items-center">
      <label htmlFor={id}>{label}</label>
        <input
          type="date"
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-foreground rounded-3xl p-3.5 text-center focus:outline-none appearance-none"
        />
    </div>
  )
}

export default DateInput


import React from 'react'

interface TextareaProps {
  id: string
  name: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}

const Textarea = ({ id, name, label, placeholder, value, onChange, rows = 4 }: TextareaProps) => {
  return (
    <div className="col-flex gap-3.5 items-center">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        className="w-full border border-foreground rounded-3xl p-3.5 focus:outline-none resize-none"
      />
    </div>
  )
}

export default Textarea

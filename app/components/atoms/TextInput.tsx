import React from 'react'

interface TextInputProps {
  id: string
  name: string
  type: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TextInput = ({ id, name, type, label, placeholder, value, onChange }: TextInputProps) => {
  // Determine if this is a controlled component
  const isControlled = onChange !== undefined
  
  return (
    <div className="col-flex gap-3.5 items-center">
        <label htmlFor={id}>{label}</label>
        <input 
          type={type} 
          id={id} 
          name={name} 
          placeholder={placeholder}
          {...(isControlled 
            ? { value: value || '', onChange } 
            : value !== undefined 
              ? { defaultValue: value, readOnly: true }
              : {}
          )}
          className="w-full border border-foreground rounded-3xl p-3.5 text-center focus:outline-none" 
        />
    </div>
  )
}

export default TextInput
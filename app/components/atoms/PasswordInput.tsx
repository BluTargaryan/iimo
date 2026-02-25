import React from 'react'

interface PasswordInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const PasswordInput = ({ id, name, label, placeholder, value, onChange }: PasswordInputProps) => {
  const isControlled = onChange !== undefined
  
  return (
    <div className="w-full col-flex gap-3.5 items-center">
        <label htmlFor={id}>{label}</label>
        <input 
          id={id} 
          name={name} 
          type="password" 
          placeholder={placeholder || "Enter your password"}
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

export default PasswordInput
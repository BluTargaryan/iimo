import React from 'react'

const TextInput = ({ id, name, type, label, placeholder }: { id: string, name: string, type: string, label: string, placeholder: string }) => {
  return (
    <div className="col-flex gap-3.5 items-center">
        <label htmlFor={id}>{label}</label>
        <input type={type} id={id} name={name} placeholder={placeholder}
        className="w-full border border-foreground rounded-3xl p-3.5 text-center 
        " />
    </div>
  )
}

export default TextInput
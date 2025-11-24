import React from 'react'

const TextInput = ({ id, name, label }: { id: string, name: string, label: string, placeholder: string }) => {
  return (
    <div className="col-flex gap-3.5 items-center">
        <label htmlFor={id}>{label}</label>
        <input id={id} name={name} type="password" placeholder="Enter your password"
        className="w-full border border-foreground rounded-3xl p-3.5 text-center
        " />
    </div>
  )
}

export default TextInput
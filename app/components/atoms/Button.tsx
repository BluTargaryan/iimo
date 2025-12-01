import React from 'react'

interface ButtonProps {
  className: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const Button = ({ className, children, onClick, type = 'button', disabled = false }: ButtonProps) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`rounded-3xl ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
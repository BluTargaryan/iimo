import React from 'react'

interface ButtonProps {
  className: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
}

const Button = ({ className, children, onClick, type = 'button' }: ButtonProps) => {
  return (
    <button type={type} onClick={onClick} className={`rounded-3xl ${className}`}>{children}</button>
  )
}

export default Button
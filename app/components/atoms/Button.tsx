import React from 'react'

const Button = ({ className, children }: { className: string, children: React.ReactNode }) => {
  return (
    <button className={`rounded-3xl p-3.5 ${className}`}>{children}</button>
  )
}

export default Button
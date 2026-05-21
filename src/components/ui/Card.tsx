import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warning' | 'danger' | 'success'
}

const variantClasses = {
  default: 'bg-white border-gray-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200',
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-xl border p-4 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 {...props} className={`font-semibold text-gray-900 mb-1 ${className}`}>
      {children}
    </h3>
  )
}

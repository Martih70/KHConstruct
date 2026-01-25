import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  hover?: boolean
}

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6
        ${hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

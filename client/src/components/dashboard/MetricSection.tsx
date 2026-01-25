import React from 'react'

interface MetricSectionProps {
  title: string
  icon?: string
  children: React.ReactNode
  description?: string
  layout?: 'grid' | 'custom'
}

export default function MetricSection({ title, icon, children, description, layout = 'custom' }: MetricSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className="text-xl font-semibold text-khc-primary">{title}</h2>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {children}
      </div>
    </div>
  )
}

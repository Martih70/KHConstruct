import React from 'react'
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters'

export type StatCardFormat = 'currency' | 'percentage' | 'number'
export type StatCardColor = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface TrendIndicator {
  value: number
  direction: 'up' | 'down' | 'neutral'
  label?: string
}

interface StatCardProps {
  label: string
  value: number | string
  format?: StatCardFormat
  trend?: TrendIndicator
  color?: StatCardColor
  icon?: string
  subtitle?: string
  isLoading?: boolean
}

const colorMap: Record<StatCardColor, { border: string; text: string; bg: string }> = {
  primary: {
    border: 'border-khc-primary',
    text: 'text-khc-primary',
    bg: 'bg-blue-50',
  },
  success: {
    border: 'border-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
  },
  warning: {
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  danger: {
    border: 'border-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
  info: {
    border: 'border-purple-500',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
  },
}

function formatValue(value: number | string, format?: StatCardFormat): string {
  if (typeof value === 'string') return value

  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value, 1)
    case 'number':
    default:
      return formatNumber(value, 0)
  }
}

export default function StatCard({
  label,
  value,
  format = 'number',
  trend,
  color = 'primary',
  icon,
  subtitle,
  isLoading = false,
}: StatCardProps) {
  const colors = colorMap[color]

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colors.border}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const displayValue = formatValue(value, format)

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colors.border} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${colors.text}`}>{displayValue}</p>

          {trend && (
            <div className="mt-3 flex items-center gap-1">
              {trend.direction === 'up' && (
                <span className="inline-flex items-center text-green-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 5a1 1 0 01.707.293l2.828 2.829a1 1 0 11-1.414 1.414L13 8.586V15a1 1 0 11-2 0V8.586l-1.121 1.121a1 1 0 11-1.414-1.414l2.828-2.829A1 1 0 0112 5z" clipRule="evenodd" />
                  </svg>
                  {trend.value}%
                </span>
              )}
              {trend.direction === 'down' && (
                <span className="inline-flex items-center text-red-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 15a1 1 0 01-.707-.293l-2.828-2.829a1 1 0 011.414-1.414L11 11.414V5a1 1 0 112 0v5.414l1.121-1.121a1 1 0 111.414 1.414l-2.828 2.829A1 1 0 0112 15z" clipRule="evenodd" />
                  </svg>
                  {trend.value}%
                </span>
              )}
              {trend.direction === 'neutral' && (
                <span className="inline-flex items-center text-gray-600 text-sm font-medium">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mx-1"></span>
                  {trend.value}%
                </span>
              )}
              {trend.label && <span className="text-gray-500 text-sm ml-1">({trend.label})</span>}
            </div>
          )}

          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>

        {icon && (
          <div className={`text-4xl ml-4 ${colors.bg} rounded-lg w-16 h-16 flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

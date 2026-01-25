import { useState, useEffect } from 'react'

interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
  autoClose?: boolean
  autoCloseDuration?: number
}

export default function ErrorAlert({
  message,
  onDismiss,
  autoClose = false,
  autoCloseDuration = 5000,
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, autoCloseDuration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDuration, isVisible, onDismiss])

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <div className="flex-shrink-0 pt-0.5">
        <svg
          className="w-5 h-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="text-red-600 hover:text-red-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}


interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`
          border-4 border-gray-200 border-t-khc-primary rounded-full animate-spin
          ${sizeClasses[size]}
        `}
      />
      {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
    </div>
  )
}

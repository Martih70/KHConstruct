import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  label?: string
  className?: string
}

export default function BackButton({ label = 'Back', className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-gray-200 hover:bg-gray-300
        text-gray-700
        rounded-lg font-medium
        transition duration-200
        ${className}
      `}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label}
    </button>
  )
}

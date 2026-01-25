interface ApprovalRateChartProps {
  approvalRate: number
  isLoading?: boolean
}

export default function ApprovalRateChart({ approvalRate, isLoading = false }: ApprovalRateChartProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-8 animate-pulse flex items-center justify-center">
        <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (approvalRate / 100) * circumference

  const getColor = () => {
    if (approvalRate >= 80) return 'text-green-600'
    if (approvalRate >= 60) return 'text-blue-600'
    if (approvalRate >= 40) return 'text-amber-600'
    return 'text-red-600'
  }

  const getGradientColor = () => {
    if (approvalRate >= 80) return 'from-green-400 to-emerald-500'
    if (approvalRate >= 60) return 'from-blue-400 to-cyan-500'
    if (approvalRate >= 40) return 'from-amber-400 to-orange-500'
    return 'from-red-400 to-rose-500'
  }

  const getBackgroundGradient = () => {
    if (approvalRate >= 80) return 'from-green-50 to-emerald-50'
    if (approvalRate >= 60) return 'from-blue-50 to-cyan-50'
    if (approvalRate >= 40) return 'from-amber-50 to-orange-50'
    return 'from-red-50 to-rose-50'
  }

  const getStatus = () => {
    if (approvalRate >= 80) return { label: 'Excellent', emoji: '🚀' }
    if (approvalRate >= 60) return { label: 'Good', emoji: '👍' }
    if (approvalRate >= 40) return { label: 'Moderate', emoji: '⚡' }
    return { label: 'Low', emoji: '⚠️' }
  }

  const status = getStatus()

  return (
    <div className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-lg shadow-md overflow-hidden`}>
      <div className={`px-6 py-4 bg-gradient-to-r ${getGradientColor()}`}>
        <h3 className="font-semibold text-white">Estimate Approval Performance</h3>
      </div>

      <div className="px-8 py-10 flex flex-col items-center">
        {/* Circular progress indicator */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="12" />

            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradientStroke)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={approvalRate >= 80 ? '#10b981' : approvalRate >= 60 ? '#3b82f6' : approvalRate >= 40 ? '#f59e0b' : '#ef4444'} />
                <stop offset="100%" stopColor={approvalRate >= 80 ? '#059669' : approvalRate >= 60 ? '#0284c7' : approvalRate >= 40 ? '#d97706' : '#dc2626'} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold mb-1">
              <span className={getColor()}>{Math.round(approvalRate)}%</span>
            </span>
            <span className="text-3xl mb-2">{status.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{status.label}</span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="w-full mt-8 pt-8 border-t border-gray-300">
          <p className="text-xs text-gray-600 font-medium mb-3">Interpretation</p>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            {approvalRate >= 80 && (
              <p className="text-sm text-green-800">
                <span className="font-semibold">Excellent performance!</span> Your team has a strong approval track record. Keep maintaining these standards.
              </p>
            )}
            {approvalRate >= 60 && approvalRate < 80 && (
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Good progress.</span> Most estimates are moving forward. Consider reviewing rejection patterns to improve further.
              </p>
            )}
            {approvalRate >= 40 && approvalRate < 60 && (
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Room for improvement.</span> Over half of estimates are being rejected. Review estimation accuracy and client feedback.
              </p>
            )}
            {approvalRate < 40 && (
              <p className="text-sm text-red-800">
                <span className="font-semibold">Attention needed.</span> Low approval rates indicate potential issues with estimating. Investigate rejection reasons.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

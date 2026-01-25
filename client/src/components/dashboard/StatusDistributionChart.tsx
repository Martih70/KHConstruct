interface StatusCounts {
  draft: number
  submitted: number
  approved: number
  rejected: number
  completed: number
}

interface StatusDistributionChartProps {
  data: StatusCounts
  isLoading?: boolean
}

const statuses = [
  { key: 'draft', label: 'Draft', color: 'bg-yellow-400', textColor: 'text-yellow-700' },
  { key: 'submitted', label: 'Pending', color: 'bg-blue-400', textColor: 'text-blue-700' },
  { key: 'approved', label: 'Approved', color: 'bg-green-400', textColor: 'text-green-700' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-400', textColor: 'text-red-700' },
  { key: 'completed', label: 'Completed', color: 'bg-gray-400', textColor: 'text-gray-700' },
]

export default function StatusDistributionChart({ data, isLoading = false }: StatusDistributionChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const total = Object.values(data).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Estimate Status Distribution</h3>

      {total === 0 ? (
        <p className="text-center text-gray-600 py-8">No projects yet</p>
      ) : (
        <div className="space-y-3">
          {statuses.map((status) => {
            const count = data[status.key as keyof StatusCounts]
            const percentage = ((count / total) * 100).toFixed(0)

            return (
              <div key={status.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{status.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${status.textColor}`}>{count}</span>
                    <span className="text-xs text-gray-500">{percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className={`${status.color} h-full rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface ProjectsByStatus {
  draft: number
  submitted: number
  approved: number
  rejected: number
  completed: number
}

interface ProjectPipelineFunnelProps {
  data: ProjectsByStatus
  isLoading?: boolean
}

export default function ProjectPipelineFunnel({ data, isLoading = false }: ProjectPipelineFunnelProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 animate-pulse" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const total = Object.values(data).reduce((a, b) => a + b, 0)

  const stages = [
    { label: 'Draft', value: data.draft, color: 'from-blue-300 to-blue-400', textColor: 'text-blue-600' },
    { label: 'Pending Review', value: data.submitted, color: 'from-yellow-200 to-yellow-300', textColor: 'text-black' },
    { label: 'Approved', value: data.approved, color: 'from-green-300 to-green-400', textColor: 'text-green-600' },
    { label: 'Completed', value: data.completed, color: 'from-slate-400 to-slate-500', textColor: 'text-slate-700' },
  ]

  return (
    <div>
      <h3 className="font-semibold text-gray-900 text-lg mb-8">📊 Project Progress</h3>
      <div className="bg-white rounded-lg" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
        <div className="px-6 py-12">
          {/* Line graph visualization */}
        <div className="flex items-end justify-between gap-2 h-32 mb-6">
          {stages.map((stage) => {
            const percentage = total > 0 ? (stage.value / Math.max(...Object.values(data).filter(v => typeof v === 'number')) || 1) * 100 : 0
            const height = Math.max(20, percentage)

            return (
              <div key={stage.label} className="flex-1 flex flex-col items-center">
                {/* Vertical bar */}
                <div className="w-full flex justify-center mb-2">
                  <div
                    className={`w-10 rounded-t-lg bg-gradient-to-t ${stage.color} shadow-md transition-all`}
                    style={{ height: `${height}px`, minHeight: '20px' }}
                  />
                </div>

                {/* Stage circle with value */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stage.color} shadow-md flex items-center justify-center mb-2 flex-shrink-0`}>
                  <span className={`${stage.textColor} font-bold text-sm`}>{stage.value}</span>
                </div>

                {/* Label and percentage */}
                <p className="text-xs font-semibold text-gray-900 text-center">{stage.label}</p>
                <p className="text-xs font-medium text-gray-700">
                  {total > 0 ? ((stage.value / total) * 100).toFixed(0) : 0}%
                </p>
              </div>
            )
          })}
        </div>

        {/* Rejected projects indicator */}
        {data.rejected > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between bg-rose-50 rounded-lg p-3">
            <div>
              <p className="text-xs font-semibold text-rose-900">Rejected</p>
            </div>
            <div className="text-xl font-bold text-rose-600">{data.rejected}</div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

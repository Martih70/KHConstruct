import { formatCurrency } from '../../utils/formatters'

interface Project {
  id: number
  name: string
  budget_cost?: number
  estimate_totals?: {
    grand_total: number
  }
  status: string
}

interface ProjectsAtRiskTableProps {
  projects: Project[]
  isLoading?: boolean
}

export default function ProjectsAtRiskTable({ projects, isLoading = false }: ProjectsAtRiskTableProps) {
  const atRiskProjects = projects
    .filter((p) => {
      if (!p.budget_cost || !p.estimate_totals?.grand_total) return false
      return p.estimate_totals.grand_total > p.budget_cost
    })
    .sort((a, b) => {
      const overageA = (a.estimate_totals?.grand_total || 0) - (a.budget_cost || 0)
      const overageB = (b.estimate_totals?.grand_total || 0) - (b.budget_cost || 0)
      return overageB - overageA
    })
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (atRiskProjects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
        <h3 className="font-semibold text-gray-900 mb-4">Projects at Risk</h3>
        <p className="text-center text-gray-600 py-8">✓ No projects over budget</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-red-500">
      <div className="px-6 py-4 bg-red-50 border-b">
        <h3 className="font-semibold text-gray-900">⚠️ Projects at Risk</h3>
        <p className="text-xs text-gray-600 mt-1">{atRiskProjects.length} project(s) over budget</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Project</th>
              <th className="px-6 py-3 text-right font-medium text-gray-700">Budget</th>
              <th className="px-6 py-3 text-right font-medium text-gray-700">Estimate</th>
              <th className="px-6 py-3 text-right font-medium text-red-700">Overage</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {atRiskProjects.map((project) => {
              const budget = project.budget_cost || 0
              const estimate = project.estimate_totals?.grand_total || 0
              const overage = estimate - budget
              const percentage = ((overage / budget) * 100).toFixed(1)

              return (
                <tr key={project.id} className="hover:bg-red-50 transition">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-600">{formatCurrency(budget)}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">{formatCurrency(estimate)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-red-600">{formatCurrency(overage)}</span>
                      <span className="text-xs text-red-500">+{percentage}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

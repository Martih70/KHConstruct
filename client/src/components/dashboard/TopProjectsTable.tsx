import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'

interface Project {
  id: number
  name: string
  estimate_totals?: {
    grand_total: number
  }
  budget_cost?: number
  status: string
  estimate_status: string
}

interface TopProjectsTableProps {
  projects: Project[]
  isLoading?: boolean
}

export default function TopProjectsTable({ projects, isLoading = false }: TopProjectsTableProps) {
  const topProjects = projects
    .filter((p) => p.estimate_totals?.grand_total || p.budget_cost)
    .sort((a, b) => (b.estimate_totals?.grand_total || b.budget_cost || 0) - (a.estimate_totals?.grand_total || a.budget_cost || 0))
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700'
      case 'submitted':
        return 'bg-sky-100 text-sky-700'
      case 'rejected':
        return 'bg-rose-100 text-rose-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 animate-pulse" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (topProjects.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
        <h3 className="font-semibold text-gray-900 mb-4">Projects by Value</h3>
        <p className="text-center text-gray-600 py-8">No projects with estimates yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
      <div className="px-6 py-4 bg-gradient-to-r from-khc-primary to-khc-secondary">
        <h3 className="font-semibold text-white">💎 Projects by Value</h3>
        <p className="text-xs text-gray-200 mt-1">{topProjects.length} largest projects</p>
      </div>

      <div className="divide-y">
        {topProjects.map((project, index) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-khc-primary text-white font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{project.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                      project.estimate_status
                    )}`}
                  >
                    {project.estimate_status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-khc-primary text-lg">{formatCurrency(project.estimate_totals?.grand_total || project.budget_cost || 0)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

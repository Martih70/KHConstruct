import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjectsStore } from '../stores/projectsStore'
import { clientsAPI, contractorsAPI } from '../services/api'
import TopProjectsTable from '../components/dashboard/TopProjectsTable'
import ProjectPipelineFunnel from '../components/dashboard/ProjectPipelineFunnel'
import { getProjectsByStatus } from '../utils/dashboardAnalytics'

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects, isLoading, fetchProjects } = useProjectsStore()
  const [activeClientsCount, setActiveClientsCount] = useState<number>(0)
  const [activeContractorsCount, setActiveContractorsCount] = useState<number>(0)
  const [isLoadingResources, setIsLoadingResources] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchResourceCounts()
  }, [])

  const fetchResourceCounts = async () => {
    setIsLoadingResources(true)
    try {
      const [clientsResponse, contractorsResponse] = await Promise.all([
        clientsAPI.getAll({ is_active: true }),
        contractorsAPI.getAll({ is_active: true }),
      ])

      setActiveClientsCount(clientsResponse.data.data?.length || 0)
      setActiveContractorsCount(contractorsResponse.data.data?.length || 0)
    } catch (error) {
      console.error('Failed to fetch resource counts:', error)
    } finally {
      setIsLoadingResources(false)
    }
  }

  // Calculate metrics
  const projectsByStatus = getProjectsByStatus(projects)

  // Get recent projects (5 most recent)
  const recentProjects = projects.slice(0, 5)

  // Determine visible sections based on role
  const visibleSections = {
    financial: user?.role === 'admin' || user?.role === 'estimator',
    operational: user?.role === 'admin' || user?.role === 'estimator',
    resources: user?.role === 'admin' || user?.role === 'estimator',
    pipeline: true, // all roles
  }

  return (
    <div className="space-y-8">
      {/* TOP BANNER - 3 Elements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Welcome & Key Metric */}
        <div className="bg-gradient-to-br from-khc-primary to-khc-secondary rounded-lg p-6 text-white" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.username}! 👋</h1>
          <p className="text-gray-100 text-sm mb-4">Dashboard Overview</p>
          <hr className="border-white border-opacity-20 mb-4" />
          {projects.length > 0 && (
            <div>
              <p className="text-xs text-gray-200 mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-white">{projects.length}</p>
            </div>
          )}
        </div>

        {/* 2. Recent Projects Mini */}
        <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
          <div className="px-6 py-3 bg-gray-50 border-b">
            <h2 className="text-sm font-semibold text-khc-primary">🕐 Active Projects</h2>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-gray-600 text-sm">Loading...</div>
          ) : recentProjects.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-sm">No projects yet</div>
          ) : (
            <div className="divide-y max-h-64 overflow-y-auto">
              {recentProjects.slice(0, 3).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="px-6 py-3 hover:bg-gray-50 transition flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-khc-primary text-sm truncate group-hover:underline">{project.name}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded font-medium ${
                        project.estimate_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : project.estimate_status === 'submitted'
                            ? 'bg-sky-100 text-sky-700'
                            : project.estimate_status === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.estimate_status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!isLoading && recentProjects.length > 3 && (
            <div className="px-6 py-2 bg-gray-50 border-t text-center">
              <Link to="/projects" className="text-khc-primary hover:underline text-xs font-medium">
                View all {projects.length}
              </Link>
            </div>
          )}
        </div>

        {/* 3. Quick Actions */}
        {(user?.role === 'admin' || user?.role === 'estimator') && (
          <div className="space-y-3">
            <Link
              to="/projects/new"
              className="group block bg-khc-primary hover:bg-khc-neutral text-white rounded-lg p-4 transition-all text-center"
              style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="text-2xl mb-1">🚀</div>
              <h3 className="font-semibold">Create Project</h3>
            </Link>
            <Link
              to="/projects"
              className="group block bg-khc-secondary hover:bg-khc-primary text-white rounded-lg p-4 transition-all text-center"
              style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="text-2xl mb-1">📊</div>
              <h3 className="font-semibold">All Projects</h3>
            </Link>
          </div>
        )}
      </div>

      {/* Top Projects */}
      {visibleSections.financial && <TopProjectsTable projects={projects} isLoading={isLoading} />}

      {/* Resources */}
      {visibleSections.resources && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-khc-primary rounded-lg p-8 text-white overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-100 text-sm font-medium mb-1">Active Clients</p>
            <p className="text-5xl font-bold text-white">{activeClientsCount}</p>
          </div>

          <div className="bg-khc-neutral rounded-lg p-8 text-white overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
            <div className="text-6xl mb-4">👷</div>
            <p className="text-gray-100 text-sm font-medium mb-1">Active Contractors</p>
            <p className="text-5xl font-bold text-white">{activeContractorsCount}</p>
          </div>
        </div>
      )}

      {/* Project Pipeline */}
      {visibleSections.pipeline && <ProjectPipelineFunnel data={projectsByStatus} isLoading={isLoading} />}
    </div>
  )
}

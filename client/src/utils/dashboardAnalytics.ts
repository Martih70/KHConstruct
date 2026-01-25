/**
 * Dashboard analytics calculations
 * Client-side calculations for professional KPIs
 */

interface ProjectWithEstimates {
  id: number
  status: 'draft' | 'in_progress' | 'completed'
  estimate_status: 'draft' | 'submitted' | 'approved' | 'rejected'
  budget_cost?: number
  estimate_totals?: {
    grand_total: number
    floor_area_m2?: number
    subtotal: number
    contingency_amount: number
    contingency_percentage: number
  }
}

/**
 * Calculate the total portfolio value (sum of active project estimates)
 */
export function calculatePortfolioValue(projects: ProjectWithEstimates[]): number {
  return projects
    .filter((p) => p.status !== 'completed')
    .reduce((sum, project) => {
      const value = project.estimate_totals?.grand_total || project.budget_cost || 0
      return sum + value
    }, 0)
}

/**
 * Calculate average project value across all projects
 */
export function calculateAverageProjectValue(projects: ProjectWithEstimates[]): number {
  if (projects.length === 0) return 0

  const totalValue = projects.reduce((sum, project) => {
    const value = project.estimate_totals?.grand_total || project.budget_cost || 0
    return sum + value
  }, 0)

  return totalValue / projects.length
}

/**
 * Calculate number and percentage of projects exceeding budget
 */
export function calculateProjectsOverBudget(
  projects: ProjectWithEstimates[]
): { count: number; percentage: number } {
  if (projects.length === 0) return { count: 0, percentage: 0 }

  const overBudget = projects.filter((p) => {
    if (!p.budget_cost || !p.estimate_totals?.grand_total) return false
    return p.estimate_totals.grand_total > p.budget_cost
  })

  const percentage = (overBudget.length / projects.length) * 100

  return {
    count: overBudget.length,
    percentage: Math.round(percentage * 10) / 10,
  }
}

/**
 * Calculate estimate approval rate: (Approved / Submitted + Approved) × 100%
 */
export function calculateApprovalRate(projects: ProjectWithEstimates[]): number {
  const submittedOrApproved = projects.filter(
    (p) => p.estimate_status === 'submitted' || p.estimate_status === 'approved'
  ).length

  if (submittedOrApproved === 0) return 0

  const approved = projects.filter((p) => p.estimate_status === 'approved').length

  return Math.round((approved / submittedOrApproved) * 1000) / 10
}

/**
 * Calculate average cost per square meter across projects with floor_area_m2
 */
export function calculateAvgCostPerM2(projects: ProjectWithEstimates[]): number | null {
  const projectsWithArea = projects.filter(
    (p) => p.estimate_totals?.floor_area_m2 && p.estimate_totals.floor_area_m2 > 0 && p.estimate_totals?.grand_total
  )

  if (projectsWithArea.length === 0) return null

  const sum = projectsWithArea.reduce((total, p) => {
    const costPerM2 = p.estimate_totals!.grand_total / p.estimate_totals!.floor_area_m2!
    return total + costPerM2
  }, 0)

  return Math.round((sum / projectsWithArea.length) * 100) / 100
}

/**
 * Calculate status breakdown: percentage of active vs completed
 */
export function calculateStatusBreakdown(
  projects: ProjectWithEstimates[]
): { active: number; completed: number; activePercentage: number; completedPercentage: number } {
  if (projects.length === 0) {
    return { active: 0, completed: 0, activePercentage: 0, completedPercentage: 0 }
  }

  const completed = projects.filter((p) => p.status === 'completed').length
  const active = projects.length - completed

  return {
    active,
    completed,
    activePercentage: Math.round((active / projects.length) * 1000) / 10,
    completedPercentage: Math.round((completed / projects.length) * 1000) / 10,
  }
}

/**
 * Calculate estimate submission rate: (Submitted + Approved / Total) × 100%
 */
export function calculateEstimateSubmissionRate(projects: ProjectWithEstimates[]): number {
  if (projects.length === 0) return 0

  const submitted = projects.filter(
    (p) => p.estimate_status === 'submitted' || p.estimate_status === 'approved'
  ).length

  return Math.round((submitted / projects.length) * 1000) / 10
}

/**
 * Get projects by status for pipeline view
 */
export function getProjectsByStatus(
  projects: ProjectWithEstimates[]
): {
  draft: number
  submitted: number
  approved: number
  rejected: number
  completed: number
} {
  return {
    draft: projects.filter((p) => p.estimate_status === 'draft').length,
    submitted: projects.filter((p) => p.estimate_status === 'submitted').length,
    approved: projects.filter((p) => p.estimate_status === 'approved').length,
    rejected: projects.filter((p) => p.estimate_status === 'rejected').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  }
}

export type ProjectStatus = 'draft' | 'in_progress' | 'completed'
export type EstimateStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Project {
  id: number
  name: string
  client_id: number
  contractor_id?: number
  budget_cost?: number
  start_date: string
  project_address?: string
  description?: string
  notes?: string
  created_by: number
  status: ProjectStatus
  estimate_status: EstimateStatus
  approved_by?: number
  approved_at?: string
  approval_notes?: string
  created_at: string
  updated_at: string
  estimate_totals?: {
    project_id: number
    floor_area_m2?: number
    categories: any[]
    subtotal: number
    contingency_amount: number
    contingency_percentage: number
    grand_total: number
    cost_per_m2?: number
    contractor_cost_total: number
    volunteer_cost_total: number
  }
}

export interface CreateProjectRequest {
  name: string
  client_id: number
  contractor_id?: number
  budget_cost?: number
  start_date: string
  project_address?: string
  description?: string
  notes?: string
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus
}

export interface ProjectsListResponse {
  success: boolean
  data: Project[]
  count: number
}

export interface ProjectDetailResponse {
  success: boolean
  data: Project & {
    estimate_totals?: {
      project_id: number
      floor_area_m2?: number
      categories: any[]
      subtotal: number
      contingency_amount: number
      contingency_percentage: number
      grand_total: number
      cost_per_m2?: number
      contractor_cost_total: number
      volunteer_cost_total: number
    }
  }
}

export interface ProjectResponse {
  success: boolean
  data: Project
}

export interface ProjectApprovalRequest {
  notes?: string
}

export interface ProjectRejectionRequest {
  reason?: string
}

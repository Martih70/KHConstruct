/**
 * Reporting and Analysis Type Definitions
 */

export interface ProjectActuals {
  id: number
  project_id: number
  cost_item_id: number
  actual_quantity: number
  actual_cost: number
  variance_reason?: string
  completed_date: string
  recorded_by: number
  created_at: string
  updated_at?: string
}

export interface CreateProjectActualsRequest {
  cost_item_id: number
  actual_quantity: number
  actual_cost: number
  variance_reason?: string
  completed_date: string
}

export interface UpdateProjectActualsRequest extends Partial<CreateProjectActualsRequest> {}

export interface HistoricCostAnalysis {
  id: number
  category_id: number
  sub_element_id: number
  cost_per_m2: number
  region?: string
  building_age_range: string // e.g., "0-10", "10-20", "20-30", "30+"
  condition_rating_range: string // e.g., "1-2", "3", "4-5"
  sample_size: number
  std_deviation: number
  based_on_projects: number
  calculation_date: string
  notes?: string
}

export interface CostVariance {
  estimated: number
  actual: number
  variance: number
  variancePercent: number
  status: 'under' | 'over' | 'on-target'
}

export interface ProjectCostComparison {
  project_id: number
  project_name: string
  estimated_total: number
  actual_total: number
  variance: number
  variancePercent: number
  status: 'completed' | 'in-progress' | 'pending'
  completion_date?: string
  cost_per_m2_estimated?: number
  cost_per_m2_actual?: number
  cost_per_m2_benchmark?: number
}

export interface CostTrendData {
  period: string
  average_cost_per_m2: number
  project_count: number
  variance_percent: number
}

export interface ReportData {
  project_id: number
  project_name: string
  estimated_costs: {
    subtotal: number
    contingency: number
    grand_total: number
    cost_per_m2?: number
  }
  actual_costs?: {
    subtotal: number
    contingency: number
    grand_total: number
    cost_per_m2?: number
  }
  line_items: {
    description: string
    category: string
    estimated: number
    actual?: number
    variance?: number
  }[]
  completion_date?: string
  notes?: string
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel'
  includeActuals: boolean
  includeAnalysis: boolean
  includeLineItems: boolean
}

// Response types
export interface ProjectActualsResponse {
  data: ProjectActuals
}

export interface ProjectActualsListResponse {
  data: ProjectActuals[]
}

export interface HistoricAnalysisResponse {
  data: HistoricCostAnalysis
}

export interface HistoricAnalysisListResponse {
  data: HistoricCostAnalysis[]
}

export interface ReportDataResponse {
  data: ReportData
}

export interface CostVarianceResponse {
  data: CostVariance
}

export interface ProjectComparisonResponse {
  data: ProjectCostComparison[]
}

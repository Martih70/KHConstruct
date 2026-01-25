/**
 * Cost Database Type Definitions
 * Defines interfaces for categories, sub-elements, units, and cost items
 */

export interface CostCategory {
  id: number
  code: string
  name: string
  description?: string
  sort_order: number
  created_at: string
  updated_at?: string
}

export interface CreateCostCategoryRequest {
  code: string
  name: string
  description?: string
  sort_order?: number
}

export interface UpdateCostCategoryRequest extends Partial<CreateCostCategoryRequest> {}

export interface CostSubElement {
  id: number
  category_id: number
  code: string
  name: string
  description?: string
  sort_order: number
  created_at: string
  updated_at?: string
}

export interface CreateCostSubElementRequest {
  category_id: number
  code: string
  name: string
  description?: string
  sort_order?: number
}

export interface UpdateCostSubElementRequest extends Partial<CreateCostSubElementRequest> {}

export interface Unit {
  id: number
  code: string
  name: string
  unit_type: 'area' | 'length' | 'count' | 'time'
}

export interface CostItem {
  id: number
  sub_element_id: number
  code: string
  description: string
  unit_id: number
  material_cost: number
  management_cost: number
  contractor_cost: number
  is_contractor_required: boolean
  volunteer_hours_estimated?: number
  waste_factor: number
  currency: string
  price_date?: string
  region?: string
  date_recorded: string
  project_source_id?: number
  created_at: string
  updated_at?: string
  // Include related entities for convenience
  category?: CostCategory
  sub_element?: CostSubElement
  unit?: Unit
}

export interface CreateCostItemRequest {
  sub_element_id: number
  code: string
  description: string
  unit_id: number
  material_cost: number
  management_cost?: number
  contractor_cost?: number
  is_contractor_required?: boolean
  volunteer_hours_estimated?: number
  waste_factor?: number
  currency?: string
  price_date?: string
  region?: string
}

export interface UpdateCostItemRequest extends Partial<CreateCostItemRequest> {}

export interface CostItemFilter {
  categoryId?: number
  subElementId?: number
  searchTerm?: string
  region?: string
  isContractorRequired?: boolean
}

// Response wrapper types
export interface CostCategoryResponse {
  data: CostCategory
}

export interface CostCategoriesResponse {
  data: CostCategory[]
}

export interface CostSubElementResponse {
  data: CostSubElement
}

export interface CostSubElementsResponse {
  data: CostSubElement[]
}

export interface CostItemResponse {
  data: CostItem
}

export interface CostItemsResponse {
  data: CostItem[]
}

export interface UnitsResponse {
  data: Unit[]
}

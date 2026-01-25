/**
 * Cost data import/upload types
 */

export interface CostImportRow {
  date: string
  pdCode: string
  areaCode: string
  projectNumber: string
  itemDescription: string
  amount: number
}

export interface CostImportValidationError {
  row: number
  field: string
  value: string
  error: string
}

export interface CostImportResult {
  success: boolean
  rowsProcessed: number
  rowsSuccess: number
  rowsFailed: number
  errors: CostImportValidationError[]
  importedAt: string
}

export interface CreateCostFromImportRequest {
  pdCode: string
  areaCode: string
  projectNumber: string
  description: string
  amount: number
  recordedDate: string
}

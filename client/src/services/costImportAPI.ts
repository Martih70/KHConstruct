import { AxiosError } from 'axios'
import { CostImportResult, CreateCostFromImportRequest } from '../types/costImport'
import { api } from './api'

/**
 * Cost import/upload API endpoints
 */
export const costImportAPI = {
  /**
   * Import cost data from CSV file
   * Accepts array of cost records
   */
  importCosts: async (data: CreateCostFromImportRequest[]): Promise<CostImportResult> => {
    try {
      const response = await api.post<CostImportResult>('/cost-items/import', { items: data })
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = (error.response?.data as any)?.message || (error.response?.data as any)?.error || 'Failed to import costs'
        throw new Error(message)
      }
      throw error
    }
  },

  /**
   * Validate cost import data before uploading
   */
  validateImportData: async (data: CreateCostFromImportRequest[]): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await api.post<{ valid: boolean; errors: string[] }>(
        '/cost-items/validate-import',
        { items: data }
      )
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = (error.response?.data as any)?.message || (error.response?.data as any)?.error || 'Validation failed'
        throw new Error(message)
      }
      throw error
    }
  },
}

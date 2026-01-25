import { AxiosError } from 'axios'
import api from './api'
import {
  ReportData,
  HistoricCostAnalysis,
  ProjectActuals,
  CreateProjectActualsRequest,
  UpdateProjectActualsRequest,
} from '../types/reporting'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown> | undefined
    return (data?.message as string) || error.message || 'Unknown error'
  }
  return 'Unknown error'
}

/**
 * Report data API endpoints
 */
export const reportingAPI = {
  /**
   * Fetch complete report for a project including estimates and actuals
   */
  getReportData: async (projectId: number): Promise<ReportData> => {
    try {
      const response = await api.get<{ data: ReportData }>(`/projects/${projectId}/report`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to fetch report data: ${getErrorMessage(error)}`)
    }
  },

  /**
   * Fetch historic cost analysis data (returns empty for now)
   * Can be filtered by category_id if provided
   */
  getHistoricAnalysis: async (categoryId?: number): Promise<HistoricCostAnalysis[]> => {
    try {
      // For now, return empty array as this endpoint is not yet implemented on backend
      // In the future, this would call: GET /historic-analysis?category_id=X
      return []
    } catch (error) {
      throw new Error(`Failed to fetch historic analysis: ${getErrorMessage(error)}`)
    }
  },

  /**
   * Fetch all project actuals for a specific project
   */
  getProjectActuals: async (projectId: number): Promise<ProjectActuals[]> => {
    try {
      const response = await api.get<{ data: ProjectActuals[] }>(`/projects/${projectId}/actuals`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to fetch project actuals: ${getErrorMessage(error)}`)
    }
  },

  /**
   * Add a new project actual cost record
   */
  createProjectActual: async (projectId: number, data: CreateProjectActualsRequest): Promise<ProjectActuals> => {
    try {
      const response = await api.post<{ data: ProjectActuals }>(`/projects/${projectId}/actuals`, data)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to create project actual: ${getErrorMessage(error)}`)
    }
  },

  /**
   * Update an existing project actual cost record
   */
  updateProjectActual: async (
    projectId: number,
    actualId: number,
    data: UpdateProjectActualsRequest
  ): Promise<ProjectActuals> => {
    try {
      const response = await api.put<{ data: ProjectActuals }>(
        `/projects/${projectId}/actuals/${actualId}`,
        data
      )
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to update project actual: ${getErrorMessage(error)}`)
    }
  },

  /**
   * Delete a project actual cost record
   */
  deleteProjectActual: async (projectId: number, actualId: number): Promise<void> => {
    try {
      await api.delete(`/projects/${projectId}/actuals/${actualId}`)
    } catch (error) {
      throw new Error(`Failed to delete project actual: ${getErrorMessage(error)}`)
    }
  },
}

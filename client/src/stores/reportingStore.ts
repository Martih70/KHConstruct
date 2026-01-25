import { create } from 'zustand'
import {
  ProjectActuals,
  HistoricCostAnalysis,
  ReportData,
  CreateProjectActualsRequest,
  UpdateProjectActualsRequest,
} from '../types/reporting'
import { reportingAPI } from '../services/reportingAPI'

interface ReportingState {
  // Report data
  reportData: ReportData | null
  historicAnalysis: HistoricCostAnalysis[]
  projectActuals: ProjectActuals[]

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  fetchReportData: (projectId: number) => Promise<void>
  fetchHistoricAnalysis: (categoryId?: number) => Promise<void>
  fetchProjectActuals: (projectId: number) => Promise<void>

  // Project Actuals Management
  addProjectActual: (projectId: number, data: CreateProjectActualsRequest) => Promise<ProjectActuals>
  updateProjectActual: (projectId: number, actualId: number, data: UpdateProjectActualsRequest) => Promise<ProjectActuals>
  deleteProjectActual: (projectId: number, actualId: number) => Promise<void>

  // Utilities
  clearError: () => void
  clearReportData: () => void
}

export const useReportingStore = create<ReportingState>((set, get) => ({
  reportData: null,
  historicAnalysis: [],
  projectActuals: [],
  isLoading: false,
  error: null,

  fetchReportData: async (projectId: number) => {
    set({ isLoading: true, error: null })
    try {
      const data = await reportingAPI.getReportData(projectId)
      set({ reportData: data, isLoading: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report'
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchHistoricAnalysis: async (categoryId?: number) => {
    set({ isLoading: true, error: null })
    try {
      const data = await reportingAPI.getHistoricAnalysis(categoryId)
      set({ historicAnalysis: data, isLoading: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch historic analysis'
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchProjectActuals: async (projectId: number) => {
    set({ isLoading: true, error: null })
    try {
      const data = await reportingAPI.getProjectActuals(projectId)
      set({ projectActuals: data, isLoading: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project actuals'
      set({ error: errorMessage, isLoading: false })
    }
  },

  addProjectActual: async (projectId: number, data: CreateProjectActualsRequest) => {
    try {
      const result = await reportingAPI.createProjectActual(projectId, data)
      set((state) => ({
        projectActuals: [...state.projectActuals, result],
      }))
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add project actual'
      set({ error: errorMessage })
      throw err
    }
  },

  updateProjectActual: async (projectId: number, actualId: number, data: UpdateProjectActualsRequest) => {
    try {
      const result = await reportingAPI.updateProjectActual(projectId, actualId, data)
      set((state) => ({
        projectActuals: state.projectActuals.map((actual) =>
          actual.id === actualId ? result : actual
        ),
      }))
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project actual'
      set({ error: errorMessage })
      throw err
    }
  },

  deleteProjectActual: async (projectId: number, actualId: number) => {
    try {
      await reportingAPI.deleteProjectActual(projectId, actualId)
      set((state) => ({
        projectActuals: state.projectActuals.filter((actual) => actual.id !== actualId),
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project actual'
      set({ error: errorMessage })
      throw err
    }
  },

  clearError: () => {
    set({ error: null })
  },

  clearReportData: () => {
    set({ reportData: null })
  },
}))

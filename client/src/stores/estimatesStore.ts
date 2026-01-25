import { create } from 'zustand'
import { projectEstimatesAPI } from '../services/api'
import { ProjectEstimate, ProjectEstimateTotal, CreateEstimateRequest } from '../types/estimate'

interface EstimatesState {
  // State
  estimates: ProjectEstimate[]
  estimateTotals: ProjectEstimateTotal | null
  isLoading: boolean
  error: string | null
  currentProjectId: number | null

  // Actions
  fetchEstimates: (projectId: number) => Promise<void>
  fetchEstimateSummary: (projectId: number) => Promise<void>
  addEstimate: (projectId: number, data: CreateEstimateRequest) => Promise<ProjectEstimate>
  updateEstimate: (projectId: number, estimateId: number, data: Partial<CreateEstimateRequest>) => Promise<ProjectEstimate>
  deleteEstimate: (projectId: number, estimateId: number) => Promise<void>
  clearError: () => void
  clearEstimates: () => void
}

export const useEstimatesStore = create<EstimatesState>((set, get) => ({
  // Initial state
  estimates: [],
  estimateTotals: null,
  isLoading: false,
  error: null,
  currentProjectId: null,

  // Actions
  fetchEstimates: async (projectId: number) => {
    set({ isLoading: true, error: null, currentProjectId: projectId })
    try {
      const response = await projectEstimatesAPI.getAll(projectId)
      set({
        estimates: response.data.data.estimates,
        estimateTotals: response.data.data.totals,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch estimates'
      set({ error: message, isLoading: false, estimates: [], estimateTotals: null })
      throw error
    }
  },

  fetchEstimateSummary: async (projectId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectEstimatesAPI.getSummary(projectId)
      set({
        estimateTotals: response.data.data.estimate,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch estimate summary'
      set({ error: message, isLoading: false, estimateTotals: null })
      throw error
    }
  },

  addEstimate: async (projectId: number, data: CreateEstimateRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectEstimatesAPI.create(projectId, data)
      const newEstimate = response.data.data

      // Refresh estimates to get updated totals
      await get().fetchEstimates(projectId)

      return newEstimate
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add estimate'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateEstimate: async (projectId: number, estimateId: number, data: Partial<CreateEstimateRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectEstimatesAPI.update(projectId, estimateId, data)
      const updatedEstimate = response.data.data

      // Refresh estimates to get updated totals
      await get().fetchEstimates(projectId)

      return updatedEstimate
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update estimate'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deleteEstimate: async (projectId: number, estimateId: number) => {
    set({ isLoading: true, error: null })
    try {
      await projectEstimatesAPI.delete(projectId, estimateId)

      // Refresh estimates to get updated totals
      await get().fetchEstimates(projectId)
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete estimate'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },

  clearEstimates: () => {
    set({ estimates: [], estimateTotals: null, currentProjectId: null })
  },
}))

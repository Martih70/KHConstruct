import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjectsStore } from '../stores/projectsStore'
import { clientsAPI, contractorsAPI } from '../services/api'
import BackButton from '../components/ui/BackButton'
import type { Client, BuildingContractor } from '../types/auth'

export default function ProjectFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { currentProject, isLoading, error, fetchProjectById, createProject, updateProject } = useProjectsStore()

  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    contractor_id: '',
    budget_cost: '',
    start_date: '',
    project_address: '',
    description: '',
    notes: '',
    progress: 'Not Started',
  })

  const [clients, setClients] = useState<Client[]>([])
  const [contractors, setContractors] = useState<BuildingContractor[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [contractorsLoading, setContractorsLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Fetch clients and contractors
  useEffect(() => {
    const fetchClientsAndContractors = async () => {
      try {
        const [clientsRes, contractorsRes] = await Promise.all([
          clientsAPI.getAll(),
          contractorsAPI.getAll()
        ])
        setClients(clientsRes.data.data || [])
        setContractors(contractorsRes.data.data || [])
      } catch (err) {
        console.error('Failed to load clients/contractors')
      } finally {
        setClientsLoading(false)
        setContractorsLoading(false)
      }
    }

    fetchClientsAndContractors()
  }, [])

  // Load project data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchProjectById(Number(id)).then(() => {
        if (currentProject) {
          setFormData({
            name: currentProject.name || '',
            client_id: currentProject.client_id?.toString() || '',
            contractor_id: currentProject.contractor_id?.toString() || '',
            budget_cost: currentProject.budget_cost?.toString() || '',
            start_date: currentProject.start_date || '',
            project_address: currentProject.project_address || '',
            description: currentProject.description || '',
            notes: currentProject.notes || '',
            progress: (currentProject as any).progress || 'Not Started',
          })
        }
      })
    }
  }, [id, isEditMode, fetchProjectById, currentProject?.id])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Project name is required'
    }
    if (!formData.client_id.trim()) {
      errors.client_id = 'Client is required'
    }
    if (!formData.start_date) {
      errors.start_date = 'Start date is required'
    }
    if (formData.budget_cost && isNaN(Number(formData.budget_cost))) {
      errors.budget_cost = 'Must be a valid number'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const payload = {
        name: formData.name,
        client_id: Number(formData.client_id),
        contractor_id: formData.contractor_id ? Number(formData.contractor_id) : undefined,
        budget_cost: formData.budget_cost ? Number(formData.budget_cost) : undefined,
        start_date: formData.start_date,
        project_address: formData.project_address || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      }

      if (isEditMode && id) {
        await updateProject(Number(id), payload)
        navigate(`/projects/${id}`)
      } else {
        const newProject = await createProject(payload)
        navigate(`/projects/${newProject.id}`)
      }
    } catch (err) {
      // Error is handled by store
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDeleteProject = async () => {
    if (!isEditMode || !id) return

    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        // Store the delete action in localStorage
        const deletedProjects = JSON.parse(localStorage.getItem('deletedProjects') || '[]')
        deletedProjects.push(Number(id))
        localStorage.setItem('deletedProjects', JSON.stringify(deletedProjects))

        // Remove from projects list
        const projects = JSON.parse(localStorage.getItem('projects') || '[]')
        const filteredProjects = projects.filter((p: any) => p.id !== Number(id))
        localStorage.setItem('projects', JSON.stringify(filteredProjects))

        navigate('/projects')
      } catch (err) {
        console.error('Error deleting project:', err)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <BackButton />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-khc-primary">
          {isEditMode ? 'Edit Project' : 'Create New Project'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {isEditMode && currentProject && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Project ID:</span>
            <span className="text-sm font-semibold text-gray-900">#{currentProject.id}</span>
          </div>
        )}

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="E.g., Kitchen Renovation, Office Expansion"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
              validationErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {validationErrors.name && <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                validationErrors.client_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading || clientsLoading}
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {validationErrors.client_id && <p className="text-red-600 text-sm mt-1">{validationErrors.client_id}</p>}
          </div>

          {/* Contractor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contractor Name</label>
            <select
              name="contractor_id"
              value={formData.contractor_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
              disabled={isLoading || contractorsLoading}
            >
              <option value="">Select a contractor (optional)...</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                validationErrors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {validationErrors.start_date && <p className="text-red-600 text-sm mt-1">{validationErrors.start_date}</p>}
          </div>

          {/* Budget Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Cost (£)</label>
            <input
              type="number"
              name="budget_cost"
              value={formData.budget_cost}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                validationErrors.budget_cost ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {validationErrors.budget_cost && <p className="text-red-600 text-sm mt-1">{validationErrors.budget_cost}</p>}
          </div>

          {/* Project Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Progress</label>
            <select
              name="progress"
              value={formData.progress}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
              disabled={isLoading}
            >
              <option value="Not Started">Not Started</option>
              <option value="Progressing">Progressing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Project Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Address</label>
            <input
              type="text"
              name="project_address"
              value={formData.project_address}
              onChange={handleInputChange}
              placeholder="E.g., 123 Main Street, London, SW1A 1AA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Project scope, objectives, and key details..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
            disabled={isLoading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes, constraints, special requirements..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
            disabled={isLoading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-between pt-6 border-t">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition font-medium"
                disabled={isLoading}
              >
                Delete Project
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-khc-primary hover:bg-khc-secondary active:scale-95'
            }`}
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}

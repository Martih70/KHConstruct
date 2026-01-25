import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectsStore } from '../stores/projectsStore'
import { useEstimatesStore } from '../stores/estimatesStore'
import BackButton from '../components/ui/BackButton'

interface CostItem {
  id: number
  code: string
  description: string
  material_cost: number
  management_cost: number
  contractor_cost: number
  waste_factor: number
  is_contractor_required: boolean
  unit: { code: string; name: string }
  category?: { name: string }
}

export default function ProjectEstimatesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = Number(id)

  const { currentProject, fetchProjectById, isLoading: projectLoading } = useProjectsStore()
  const { estimates, estimateTotals, isLoading: estimatesLoading, error, fetchEstimates, addEstimate, updateEstimate, deleteEstimate } = useEstimatesStore()

  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [costItemsLoading, setCostItemsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [costOverride, setCostOverride] = useState('')
  const [notes, setNotes] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch project and estimates
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
      fetchEstimates(projectId)
      fetchCostItems()
    }
  }, [projectId, fetchProjectById, fetchEstimates])

  // Fetch cost items from backend
  const fetchCostItems = async () => {
    setCostItemsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/cost-items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      const data = await response.json()
      setCostItems(data.data || [])
    } catch (err) {
      console.error('Failed to fetch cost items:', err)
    } finally {
      setCostItemsLoading(false)
    }
  }

  // Filter cost items by search
  const filteredItems = costItems.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddEstimate = async () => {
    if (!selectedItemId || !quantity) return

    try {
      setSubmitting(true)
      await addEstimate(projectId, {
        cost_item_id: selectedItemId,
        quantity: parseFloat(quantity),
        unit_cost_override: costOverride ? parseFloat(costOverride) : undefined,
        notes: notes || undefined,
      })
      // Reset form
      setSelectedItemId(null)
      setQuantity('1')
      setCostOverride('')
      setNotes('')
      setSubmitting(false)
    } catch (error) {
      setSubmitting(false)
    }
  }

  const handleUpdateEstimate = async (estimateId: number) => {
    try {
      setSubmitting(true)
      await updateEstimate(projectId, estimateId, {
        quantity: parseFloat(editQuantity),
      })
      setEditingId(null)
      setEditQuantity('')
      setSubmitting(false)
    } catch (error) {
      setSubmitting(false)
    }
  }

  const handleDeleteEstimate = async (estimateId: number) => {
    if (window.confirm('Remove this item from the estimate?')) {
      try {
        setSubmitting(true)
        await deleteEstimate(projectId, estimateId)
        setSubmitting(false)
      } catch (error) {
        setSubmitting(false)
      }
    }
  }

  const isLoading = projectLoading || estimatesLoading || costItemsLoading

  if (isLoading && !currentProject) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  if (!currentProject) {
    return <div className="text-center py-12">Project not found</div>
  }

  // Group estimates by category
  const estimatesByCategory = estimateTotals?.categories || []

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">Add Estimates</h1>
        <p className="text-gray-600 mt-2">{currentProject.name}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Cost Items Browser */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-700">Available Cost Items</h2>
            </div>

            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search cost items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary text-sm"
              />
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {costItemsLoading ? (
                <div className="p-4 text-center text-gray-600">Loading items...</div>
              ) : filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No items found</div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full text-left p-4 transition ${
                      selectedItemId === item.id ? 'bg-khc-light border-l-4 border-khc-primary' : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-600 mt-1">£{item.material_cost} / {item.unit?.code || 'unit'}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Add Estimate & Current Estimates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Estimate Form */}
          {selectedItemId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 text-khc-primary">Add to Estimate</h3>
              {costItems.find((i) => i.id === selectedItemId) && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {costItems.find((i) => i.id === selectedItemId)?.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      Material: £{costItems.find((i) => i.id === selectedItemId)?.material_cost}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost Override</label>
                      <input
                        type="number"
                        value={costOverride}
                        onChange={(e) => setCostOverride(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setSelectedItemId(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddEstimate}
                      disabled={submitting || !quantity}
                      className="flex-1 px-4 py-2 bg-khc-primary hover:bg-khc-secondary text-white rounded-lg disabled:bg-gray-400"
                    >
                      {submitting ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Estimates */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">Current Estimate Items ({estimates.length})</h3>
            </div>

            {estimatesLoading ? (
              <div className="p-6 text-center text-gray-600">Loading estimates...</div>
            ) : estimates.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No items added yet. Select an item and add quantity to begin.</div>
            ) : (
              <div className="divide-y">
                {estimatesByCategory.map((category) => (
                  <div key={category.category_id}>
                    <div className="px-6 py-3 bg-khc-light border-b">
                      <p className="font-semibold text-khc-primary">{category.category_name}</p>
                    </div>
                    {category.line_items.map((item) => {
                      const estimate = estimates.find((e) => e.id === item.estimate_id)
                      return (
                        <div key={item.estimate_id} className="px-6 py-4 border-b hover:bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{item.description}</p>
                                <p className="text-xs text-gray-600">{item.unit_code}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-khc-primary">
                                  £{item.line_total.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>

                            {editingId === item.estimate_id ? (
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <button
                                  onClick={() => handleUpdateEstimate(item.estimate_id)}
                                  disabled={submitting}
                                  className="px-3 py-1 bg-khc-primary text-white text-sm rounded disabled:bg-gray-400"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <div className="space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingId(item.estimate_id)
                                      setEditQuantity(item.quantity.toString())
                                    }}
                                    className="text-khc-primary hover:underline text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEstimate(item.estimate_id)}
                                    disabled={submitting}
                                    className="text-red-600 hover:underline text-xs disabled:text-gray-400"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {estimateTotals && (
            <div className="bg-khc-light rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    £{estimateTotals.subtotal.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Contingency ({estimateTotals.contingency_percentage}%):</span>
                  <span className="font-semibold">
                    £{estimateTotals.contingency_amount.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-khc-primary pt-3">
                  <span className="font-bold text-khc-primary">Grand Total:</span>
                  <span className="font-bold text-khc-primary text-lg">
                    £{estimateTotals.grand_total.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                {estimateTotals.cost_per_m2 && (
                  <div className="text-sm text-gray-600 text-right pt-2">
                    £{estimateTotals.cost_per_m2.toLocaleString('en-GB', { maximumFractionDigits: 2 })} per m²
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

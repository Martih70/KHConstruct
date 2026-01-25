import { useState, useEffect } from 'react'
import { Card, Button, ErrorAlert } from '../components/ui'
import BackButton from '../components/ui/BackButton'
import { InternalRate, RateCategory } from '../types/rates'

const PREDEFINED_CATEGORIES = [
  'Preliminaries',
  'Excavation & Earthworks',
  'Foundations',
  'Structure',
  'Roofing',
  'External Walls',
  'Windows & Doors',
  'Partitions & Screens',
  'Finishings',
  'Mechanical Services',
  'Electrical Services',
  'Plumbing & Drainage',
  'Site Works',
]

export default function InternalRatesBuilderPage() {
  const [rates, setRates] = useState<InternalRate[]>([])
  const [categories, setCategories] = useState<RateCategory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: '',
    category: '',
    labour: 0,
    materials: 0,
    plant: 0,
    ohp: 0,
    uom: '',
  })

  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    loadRates()
    loadCategories()
  }, [])

  const loadRates = () => {
    const stored = localStorage.getItem('internalRates')
    if (stored) {
      setRates(JSON.parse(stored))
    }
  }

  const loadCategories = () => {
    const stored = localStorage.getItem('rateCategories')
    if (stored) {
      setCategories(JSON.parse(stored))
    } else {
      // Initialize with predefined categories
      const initial: RateCategory[] = PREDEFINED_CATEGORIES.map((name, idx) => ({
        id: `cat-${idx}`,
        name,
        isCustom: false,
      }))
      setCategories(initial)
      localStorage.setItem('rateCategories', JSON.stringify(initial))
    }
  }

  const saveRates = (updatedRates: InternalRate[]) => {
    localStorage.setItem('internalRates', JSON.stringify(updatedRates))
    setRates(updatedRates)
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    if (categories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setError('Category already exists')
      return
    }

    const newCategory: RateCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      isCustom: true,
    }

    const updated = [...categories, newCategory]
    setCategories(updated)
    localStorage.setItem('rateCategories', JSON.stringify(updated))
    setNewCategoryName('')
    setShowNewCategoryInput(false)
    setSuccessMessage('Category added successfully')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleAddOrUpdateRate = () => {
    if (!formData.description.trim() || !formData.category || !formData.uom || formData.labour + formData.materials + formData.plant + formData.ohp === 0) {
      setError('Description, Category, UOM, and at least one cost component are required')
      return
    }

    let updatedRates: InternalRate[]

    if (editingId) {
      updatedRates = rates.map(r =>
        r.id === editingId
          ? {
              ...formData,
              id: editingId,
              labour: parseFloat(String(formData.labour)) || 0,
              materials: parseFloat(String(formData.materials)) || 0,
              plant: parseFloat(String(formData.plant)) || 0,
              ohp: parseFloat(String(formData.ohp)) || 0,
              createdAt: r.createdAt,
            }
          : r
      )
      setSuccessMessage('Rate updated successfully')
    } else {
      const newRate: InternalRate = {
        id: `rate-${Date.now()}`,
        description: formData.description,
        category: formData.category,
        labour: parseFloat(String(formData.labour)) || 0,
        materials: parseFloat(String(formData.materials)) || 0,
        plant: parseFloat(String(formData.plant)) || 0,
        ohp: parseFloat(String(formData.ohp)) || 0,
        uom: formData.uom,
        createdAt: new Date().toISOString(),
      }
      updatedRates = [...rates, newRate]
      setSuccessMessage('Rate added successfully')
    }

    saveRates(updatedRates)
    resetForm()
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleDeleteRate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      saveRates(rates.filter(r => r.id !== id))
      setSuccessMessage('Rate deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleEditRate = (rate: InternalRate) => {
    setFormData({
      description: rate.description,
      category: rate.category,
      labour: rate.labour,
      materials: rate.materials,
      plant: rate.plant,
      ohp: rate.ohp,
      uom: rate.uom,
    })
    setEditingId(rate.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      description: '',
      category: '',
      labour: 0,
      materials: 0,
      plant: 0,
      ohp: 0,
      uom: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Filter rates
  const filteredRates = rates.filter(rate => {
    const matchesCategory = selectedCategory === 'all' || rate.category === selectedCategory
    const matchesSearch = rate.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const groupedByCategory = filteredRates.reduce((acc, rate) => {
    if (!acc[rate.category]) {
      acc[rate.category] = []
    }
    acc[rate.category].push(rate)
    return acc
  }, {} as { [key: string]: InternalRate[] })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">Internal Rates Builder</h1>
        <p className="text-gray-600 mt-2">Create and manage your organization's rate book</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Add Rate Form */}
      {showForm && (
        <Card title={editingId ? 'Edit Rate' : 'Add New Rate'}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rate description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labour (£)*</label>
                <input
                  type="number"
                  value={formData.labour || ''}
                  onChange={(e) => setFormData({ ...formData, labour: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materials (£)*</label>
                <input
                  type="number"
                  value={formData.materials || ''}
                  onChange={(e) => setFormData({ ...formData, materials: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plant (£)*</label>
                <input
                  type="number"
                  value={formData.plant || ''}
                  onChange={(e) => setFormData({ ...formData, plant: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OHP (£)*</label>
                <input
                  type="number"
                  value={formData.ohp || ''}
                  onChange={(e) => setFormData({ ...formData, ohp: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UOM*</label>
                <input
                  type="text"
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  placeholder="e.g., m2, m3, no"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="primary" onClick={handleAddOrUpdateRate}>
                {editingId ? 'Update Rate' : 'Add Rate'}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add New Rate Button */}
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)} fullWidth>
            + Add New Rate
          </Button>
        )}

        {/* Add New Category */}
        {!showNewCategoryInput && (
          <Button variant="secondary" onClick={() => setShowNewCategoryInput(true)} fullWidth>
            + Add Category
          </Button>
        )}

        {showNewCategoryInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
            />
            <button onClick={handleAddCategory} className="px-4 py-2 bg-khc-primary text-white rounded-lg hover:bg-khc-secondary">✓</button>
            <button onClick={() => setShowNewCategoryInput(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">✕</button>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search rates by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Rates by Category */}
      {filteredRates.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">No rates found. {!showForm && <span onClick={() => setShowForm(true)} className="text-khc-primary cursor-pointer hover:underline">Add one now</span>}</p>
        </Card>
      ) : (
        Object.entries(groupedByCategory).map(([category, categoryRates]) => (
          <Card key={category} title={category}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-3 py-2 text-left font-semibold">Description</th>
                    <th className="px-3 py-2 text-right font-semibold">Labour</th>
                    <th className="px-3 py-2 text-right font-semibold">Materials</th>
                    <th className="px-3 py-2 text-right font-semibold">Plant</th>
                    <th className="px-3 py-2 text-right font-semibold">OHP</th>
                    <th className="px-3 py-2 text-center font-semibold">Total</th>
                    <th className="px-3 py-2 text-center font-semibold">UOM</th>
                    <th className="px-3 py-2 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRates.map(rate => {
                    const total = rate.labour + rate.materials + rate.plant + rate.ohp
                    return (
                      <tr key={rate.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{rate.description}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(rate.labour)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(rate.materials)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(rate.plant)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(rate.ohp)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-khc-primary">{formatCurrency(total)}</td>
                        <td className="px-3 py-2 text-center">{rate.uom}</td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            onClick={() => handleEditRate(rate)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}

      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        <p><strong>Total Rates:</strong> {rates.length}</p>
      </div>
    </div>
  )
}

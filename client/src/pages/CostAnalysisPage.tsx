import { useEffect, useState } from 'react'
import { useReportingStore } from '../stores/reportingStore'
import { useCostItemsStore } from '../stores/costItemsStore'
import { Card, LoadingSpinner, ErrorAlert, Select, Badge } from '../components/ui'
import BackButton from '../components/ui/BackButton'
import { formatCurrency } from '../utils/formatters'

export default function CostAnalysisPage() {
  const { historicAnalysis, isLoading, error, fetchHistoricAnalysis, clearError } = useReportingStore()
  const { categories, fetchCategories } = useCostItemsStore()

  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')

  useEffect(() => {
    fetchCategories()
    fetchHistoricAnalysis()
  }, [fetchCategories, fetchHistoricAnalysis])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (categoryId) {
      fetchHistoricAnalysis(Number(categoryId))
    } else {
      fetchHistoricAnalysis()
    }
  }

  // Filter by region
  const filteredAnalysis = historicAnalysis.filter((analysis) => {
    if (selectedRegion !== 'all' && analysis.region !== selectedRegion) {
      return false
    }
    return true
  })

  // Get unique regions
  const regions = ['all', ...new Set(historicAnalysis.map((a) => a.region).filter((r): r is string => !!r))]

  // Group by building age range
  const groupedByAge = filteredAnalysis.reduce(
    (acc, item) => {
      const age = item.building_age_range
      if (!acc[age]) {
        acc[age] = []
      }
      acc[age].push(item)
      return acc
    },
    {} as Record<string, typeof historicAnalysis>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading cost analysis..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">Historic Cost Analysis</h1>
        <p className="text-gray-600 mt-2">
          View cost benchmarks based on completed projects in your region
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={clearError} />}

      {/* Filters */}
      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((cat) => ({
                value: cat.id.toString(),
                label: cat.name,
              })),
            ]}
          />
          <Select
            label="Region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            options={regions.map((region) => ({
              value: region,
              label: region === 'all' ? 'All Regions' : region,
            }))}
          />
        </div>
      </Card>

      {/* Analysis Results */}
      {filteredAnalysis.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-semibold mb-2">No Historic Cost Analysis Data</p>
          <p className="text-blue-700 text-sm">
            Historic cost analysis will be available once completed projects with actual costs are recorded in the system.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByAge)
            .sort(([a], [b]) => {
              const orderMap = { '0-10': 0, '10-20': 1, '20-30': 2, '30+': 3 }
              return (orderMap[a as keyof typeof orderMap] ?? 999) -
                (orderMap[b as keyof typeof orderMap] ?? 999)
            })
            .map(([ageRange, items]) => (
              <Card key={ageRange} title={`Building Age: ${ageRange} years`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Condition Rating
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">
                          Cost per m²
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">
                          Std Deviation
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Sample Size
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item) => {
                        const confidence = item.sample_size >= 3 ? 'High' : 'Low'

                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {item.condition_rating_range}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-khc-primary">
                              {formatCurrency(item.cost_per_m2)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-gray-600">
                              ±{formatCurrency(item.std_deviation)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={item.sample_size >= 3 ? 'success' : 'warning'}>
                                {item.sample_size} projects
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={confidence === 'High' ? 'success' : 'warning'}>
                                {confidence}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Info Box */}
      <Card>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>How to interpret this data:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Cost per m²:</strong> Average cost for this category based on similar projects
            </li>
            <li>
              <strong>Std Deviation:</strong> Expected variance from the average cost
            </li>
            <li>
              <strong>Sample Size:</strong> Number of completed projects this benchmark is based on
            </li>
            <li>
              <strong>Confidence:</strong> Higher confidence indicates more reliable data (3+ projects)
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

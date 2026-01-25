import { useState, useRef } from 'react'
import { Card, Button, ErrorAlert } from '../components/ui'
import BackButton from '../components/ui/BackButton'

interface CostDatabaseRow {
  description: string
  uniqueId: string
  labour: number
  materials: number
  plant: number
  ohp: number
  uom: string
  rate: number
}

export default function PersonalCostDatabaseUploaderPage() {
  const [rows, setRows] = useState<CostDatabaseRow[]>([
    { description: '', uniqueId: '', labour: 0, materials: 0, plant: 0, ohp: 0, uom: '', rate: 0 },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const handleCellChange = (rowIdx: number, field: keyof CostDatabaseRow, value: string | number) => {
    const newRows = [...rows]
    const updatedRow = { ...newRows[rowIdx] }

    if (field === 'labour' || field === 'materials' || field === 'plant' || field === 'ohp' || field === 'rate') {
      updatedRow[field] = typeof value === 'number' ? value : parseFloat(String(value)) || 0
    } else {
      updatedRow[field] = String(value)
    }

    newRows[rowIdx] = updatedRow
    setRows(newRows)
  }

  const addRow = () => {
    setRows([
      ...rows,
      { description: '', uniqueId: '', labour: 0, materials: 0, plant: 0, ohp: 0, uom: '', rate: 0 },
    ])
  }

  const deleteRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const lines = text.trim().split('\n')

    const parsedRows: CostDatabaseRow[] = []

    for (const line of lines) {
      let values = line.split('\t')
      if (values.length < 8) {
        values = line.split(',')
      }

      if (values.length >= 8) {
        const trimmedValues = values.map(v => v.trim())
        parsedRows.push({
          description: trimmedValues[0] || '',
          uniqueId: trimmedValues[1] || '',
          labour: parseFloat(trimmedValues[2]) || 0,
          materials: parseFloat(trimmedValues[3]) || 0,
          plant: parseFloat(trimmedValues[4]) || 0,
          ohp: parseFloat(trimmedValues[5]) || 0,
          uom: trimmedValues[6] || '',
          rate: parseFloat(trimmedValues[7]) || 0,
        })
      }
    }

    if (parsedRows.length > 0) {
      const existingEmptyRows = rows.filter(r => !r.description && !r.uniqueId && r.rate === 0)
      const existingFilledRows = rows.filter(r => r.description || r.uniqueId || r.rate > 0)

      if (parsedRows.length > 1 && existingEmptyRows.length > 0 && existingFilledRows.length === 0) {
        setRows(parsedRows)
      } else {
        setRows([...rows, ...parsedRows])
      }
    }
  }

  const validateRows = (): boolean => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.description || !row.uniqueId || !row.uom || row.rate <= 0) {
        setError(`Row ${i + 1} has missing or invalid required fields`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateRows()) return

    try {
      setIsLoading(true)
      setError(null)

      const validRows = rows.filter((r) => r.description && r.uniqueId && r.uom && r.rate > 0)

      if (validRows.length === 0) {
        setError('No valid rows to import')
        setIsLoading(false)
        return
      }

      // Store in localStorage temporarily until backend is ready
      const existingData = JSON.parse(localStorage.getItem('personalCostDatabase') || '[]')
      const newData = [...existingData, ...validRows]
      localStorage.setItem('personalCostDatabase', JSON.stringify(newData))

      setSuccessMessage(
        `✓ Successfully saved ${validRows.length} cost item${validRows.length !== 1 ? 's' : ''} to your personal database`
      )
      setRows([{ description: '', uniqueId: '', labour: 0, materials: 0, plant: 0, ohp: 0, uom: '', rate: 0 }])
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to save items')
    }
  }

  const validRowCount = rows.filter((r) => r.description && r.uniqueId && r.uom && r.rate > 0).length

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">Personal Cost Database</h1>
        <p className="text-gray-600 mt-2">Build your custom cost database with labour, materials, plant and overhead costs</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Data Entry Table */}
      <Card title="Cost Items">
        <div className="space-y-4">
          <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 text-sm text-gray-600">
            💡 <strong>Tip:</strong> Click in the table and paste full rows of data (from Excel/Google Sheets). Table auto-expands to fit all rows!
          </div>

          <div className="overflow-x-auto">
            <table
              ref={tableRef}
              onPaste={handlePaste}
              className="w-full text-sm border-collapse focus:outline-none"
              tabIndex={0}
            >
              <thead>
                <tr className="bg-khc-primary text-white">
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">#</th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">Description<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">Unique ID<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-right font-semibold border border-gray-200">Labour</th>
                  <th className="px-3 py-3 text-right font-semibold border border-gray-200">Materials</th>
                  <th className="px-3 py-3 text-right font-semibold border border-gray-200">Plant</th>
                  <th className="px-3 py-3 text-right font-semibold border border-gray-200">OHP</th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">UOM<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-right font-semibold border border-gray-200">Rate<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-center font-semibold border border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50">
                    <td className="px-3 py-2 border border-gray-200 text-gray-600">{rowIdx + 1}</td>

                    {/* Description */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleCellChange(rowIdx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Unique ID */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.uniqueId}
                        onChange={(e) => handleCellChange(rowIdx, 'uniqueId', e.target.value)}
                        placeholder="e.g., ID001"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Labour */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        value={row.labour || ''}
                        onChange={(e) => handleCellChange(rowIdx, 'labour', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Materials */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        value={row.materials || ''}
                        onChange={(e) => handleCellChange(rowIdx, 'materials', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Plant */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        value={row.plant || ''}
                        onChange={(e) => handleCellChange(rowIdx, 'plant', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* OHP */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        value={row.ohp || ''}
                        onChange={(e) => handleCellChange(rowIdx, 'ohp', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* UOM */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.uom}
                        onChange={(e) => handleCellChange(rowIdx, 'uom', e.target.value)}
                        placeholder="e.g., m2, m3, no"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Rate */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        value={row.rate || ''}
                        onChange={(e) => handleCellChange(rowIdx, 'rate', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Delete Button */}
                    <td className="px-3 py-2 border border-gray-200 text-center">
                      <button
                        onClick={() => deleteRow(rowIdx)}
                        className="text-red-600 hover:text-red-800 font-semibold text-lg"
                        title="Delete row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
            <p><span className="text-red-400">*</span> Required fields: Description, Unique ID, UOM, Rate</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={addRow}>
              + Add Row
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isLoading}
              fullWidth
              disabled={validRowCount === 0}
            >
              {isLoading ? 'Saving...' : `Save ${validRowCount} Cost Item${validRowCount !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card title="How to Use">
        <div className="space-y-4 text-sm text-gray-700">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h3 className="font-semibold text-gray-900 mb-2">🚀 Fastest Method: Paste Full Database</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Select all data in Excel/Google Sheets (Ctrl+A)</li>
              <li>Copy (Ctrl+C or Cmd+C)</li>
              <li><strong>Click anywhere in the table below</strong></li>
              <li>Paste (Ctrl+V or Cmd+V)</li>
              <li>✅ Table auto-expands to match pasted rows!</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">Columns must be in order: Description, Unique ID, Labour, Materials, Plant, OHP, UOM, Rate</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Single Row Paste</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Copy one row of data from Excel</li>
              <li>Click in the table and paste</li>
              <li>Row is added to table automatically</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Manual Entry</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Click into any field and type the value</li>
              <li>Tab or click to move to next field</li>
              <li>Use the × button to delete a row</li>
              <li>Click "+ Add Row" for additional entries</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Field Guide</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>Description:</strong> Clear description of the cost item</li>
              <li><strong>Unique ID:</strong> Unique identifier (e.g., ID001, LB01)</li>
              <li><strong>Labour:</strong> Labour cost component (£ per unit)</li>
              <li><strong>Materials:</strong> Material cost component (£ per unit)</li>
              <li><strong>Plant:</strong> Plant/equipment cost component (£ per unit)</li>
              <li><strong>OHP:</strong> Overheads and profit (£ per unit)</li>
              <li><strong>UOM:</strong> Unit of measure (e.g., m2, m3, no, tonne)</li>
              <li><strong>Rate:</strong> Total rate per unit (Labour + Materials + Plant + OHP)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

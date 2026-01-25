import { useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Card, Button, ErrorAlert } from '../components/ui'
import BackButton from '../components/ui/BackButton'
import { costImportAPI } from '../services/costImportAPI'
import { CostImportRow, CreateCostFromImportRequest } from '../types/costImport'

export default function CostDataUploaderPage() {
  const { user } = useAuthStore()

  // Restrict access to admin users only
  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-700">The Data Uploader is only available to administrators.</p>
          <p className="text-red-600 text-sm mt-2">Please contact your administrator if you need access to this feature.</p>
        </div>
        <Navigate to="/dashboard" replace />
      </div>
    )
  }
  const [rows, setRows] = useState<CostImportRow[]>([
    { date: '', pdCode: '', areaCode: '', projectNumber: '', itemDescription: '', amount: 0 },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const handleCellChange = (rowIdx: number, field: keyof CostImportRow, value: string | number) => {
    const newRows = [...rows]
    const updatedRow = { ...newRows[rowIdx] }

    if (field === 'amount') {
      updatedRow.amount = typeof value === 'number' ? value : parseFloat(String(value)) || 0
    } else if (field === 'date') {
      updatedRow.date = String(value)
    } else if (field === 'pdCode') {
      updatedRow.pdCode = String(value)
    } else if (field === 'areaCode') {
      updatedRow.areaCode = String(value)
    } else if (field === 'projectNumber') {
      updatedRow.projectNumber = String(value)
    } else if (field === 'itemDescription') {
      updatedRow.itemDescription = String(value)
    }

    newRows[rowIdx] = updatedRow
    setRows(newRows)
  }

  const addRow = () => {
    setRows([
      ...rows,
      { date: '', pdCode: '', areaCode: '', projectNumber: '', itemDescription: '', amount: 0 },
    ])
  }

  const deleteRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const lines = text.trim().split('\n')

    const parsedRows: CostImportRow[] = []

    for (const line of lines) {
      // Try tab-separated first (Excel/Sheets), then comma-separated
      let values = line.split('\t')
      if (values.length < 6) {
        values = line.split(',')
      }

      if (values.length >= 6) {
        const trimmedValues = values.map(v => v.trim())
        parsedRows.push({
          date: trimmedValues[0] || '',
          pdCode: trimmedValues[1] || '',
          areaCode: trimmedValues[2] || '',
          projectNumber: trimmedValues[3] || '',
          itemDescription: trimmedValues[4] || '',
          amount: parseFloat(trimmedValues[5]) || 0,
        })
      }
    }

    if (parsedRows.length > 0) {
      // Remove empty first row if it exists and we're pasting multiple rows
      const existingEmptyRows = rows.filter(r => !r.date && !r.pdCode && !r.itemDescription && r.amount === 0)
      const existingFilledRows = rows.filter(r => r.date || r.pdCode || r.itemDescription || r.amount > 0)

      // If pasting multiple rows and we only have one empty row, replace it
      if (parsedRows.length > 1 && existingEmptyRows.length > 0 && existingFilledRows.length === 0) {
        setRows(parsedRows)
      } else {
        // Otherwise append to existing rows
        setRows([...rows, ...parsedRows])
      }
    }
  }

  const validateRows = (): boolean => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.date || !row.pdCode || !row.itemDescription || row.amount <= 0) {
        setError(`Row ${i + 1} has missing or invalid required fields`)
        return false
      }

      // Validate date format
      const dateObj = new Date(row.date)
      if (isNaN(dateObj.getTime())) {
        setError(`Row ${i + 1}: Invalid date format. Use YYYY-MM-DD`)
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

      const importData: CreateCostFromImportRequest[] = rows
        .filter((r) => r.date && r.pdCode && r.itemDescription && r.amount > 0)
        .map((row) => ({
          pdCode: row.pdCode,
          areaCode: row.areaCode,
          projectNumber: row.projectNumber,
          description: row.itemDescription,
          amount: row.amount,
          recordedDate: row.date,
        }))

      if (importData.length === 0) {
        setError('No valid rows to import')
        setIsLoading(false)
        return
      }

      const result = await costImportAPI.importCosts(importData)

      setSuccessMessage(
        `✓ Successfully imported ${result.rowsSuccess} cost items${result.rowsFailed > 0 ? `. ${result.rowsFailed} rows failed.` : '.'}`
      )
      setRows([{ date: '', pdCode: '', areaCode: '', projectNumber: '', itemDescription: '', amount: 0 }])
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : 'Import failed')
    }
  }

  const validRowCount = rows.filter((r) => r.date && r.pdCode && r.itemDescription && r.amount > 0).length

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">Cost Database Uploader</h1>
        <p className="text-gray-600 mt-2">Enter cost items directly in the table below</p>
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
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">Date<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">PD Code<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">Area Code</th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">Project Number</th>
                  <th className="px-3 py-3 text-left font-semibold border border-gray-200">Item Description<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-right font-semibold border border-gray-200">Amount<span className="text-red-400">*</span></th>
                  <th className="px-3 py-3 text-center font-semibold border border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50">
                    <td className="px-3 py-2 border border-gray-200 text-gray-600">{rowIdx + 1}</td>

                    {/* Date */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.date}
                        onChange={(e) => handleCellChange(rowIdx, 'date', e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* PD Code */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.pdCode}
                        onChange={(e) => handleCellChange(rowIdx, 'pdCode', e.target.value)}
                        placeholder="e.g., PD001"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Area Code */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.areaCode}
                        onChange={(e) => handleCellChange(rowIdx, 'areaCode', e.target.value)}
                        placeholder="e.g., AC01"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Project Number */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.projectNumber}
                        onChange={(e) => handleCellChange(rowIdx, 'projectNumber', e.target.value)}
                        placeholder="e.g., PRJ001"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Item Description */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.itemDescription}
                        onChange={(e) => handleCellChange(rowIdx, 'itemDescription', e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-khc-primary focus:border-transparent"
                      />
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        value={row.amount || ''}
                        onChange={(e) => handleCellChange(rowIdx, 'amount', e.target.value)}
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
            <p><span className="text-red-400">*</span> Required fields: Date, PD Code, Item Description, Amount</p>
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
              {isLoading ? 'Importing...' : `Import ${validRowCount} Cost Item${validRowCount !== 1 ? 's' : ''}`}
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
            <p className="text-xs text-gray-500 mt-2">Columns must be in order: Date, PD Code, Area Code, Project #, Description, Amount</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Single Row Paste</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Copy one row of data from Excel (Date through Amount)</li>
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
              <li><strong>Date:</strong> YYYY-MM-DD format (use date picker or type)</li>
              <li><strong>PD Code:</strong> Unique identifier (e.g., PD001, PD002)</li>
              <li><strong>Area Code:</strong> Work area code (e.g., AC01, AC02) - optional</li>
              <li><strong>Project Number:</strong> Project reference (e.g., PRJ001) - optional</li>
              <li><strong>Item Description:</strong> What the cost is for</li>
              <li><strong>Amount:</strong> Cost in pounds (numbers with decimals OK)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

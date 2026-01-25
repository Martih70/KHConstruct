/**
 * Export utilities for PDF, CSV, and Excel formats
 */

import { ReportData } from '../types/reporting'

/**
 * Export report data to CSV
 */
export function exportToCSV(data: ReportData, filename: string = 'report.csv'): void {
  const rows: string[][] = []

  // Header section
  rows.push(['KHConstruct Report'])
  rows.push([''])
  rows.push(['Project Name', data.project_name])
  rows.push(['Project ID', data.project_id.toString()])

  if (data.completion_date) {
    rows.push(['Completion Date', data.completion_date])
  }

  rows.push([''])
  rows.push(['Cost Summary'])
  rows.push(['', 'Estimated', data.estimated_costs.grand_total.toString()])

  if (data.actual_costs) {
    rows.push(['', 'Actual', data.actual_costs.grand_total.toString()])
    const variance = data.actual_costs.grand_total - data.estimated_costs.grand_total
    rows.push(['', 'Variance', variance.toString()])
  }

  rows.push([''])
  rows.push(['Cost Breakdown'])
  rows.push(['Subtotal', data.estimated_costs.subtotal.toString()])
  rows.push(['Contingency', data.estimated_costs.contingency.toString()])
  rows.push(['Grand Total', data.estimated_costs.grand_total.toString()])

  if (data.estimated_costs.cost_per_m2) {
    rows.push(['Cost per m²', data.estimated_costs.cost_per_m2.toString()])
  }

  rows.push([''])
  rows.push(['Line Items'])
  rows.push(['Description', 'Category', 'Estimated', 'Actual', 'Variance'])

  data.line_items.forEach((item) => {
    rows.push([
      item.description,
      item.category,
      item.estimated.toString(),
      item.actual?.toString() || '',
      item.variance?.toString() || '',
    ])
  })

  if (data.notes) {
    rows.push([''])
    rows.push(['Notes', data.notes])
  }

  // Convert to CSV string
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  // Download
  downloadFile(csv, filename, 'text/csv')
}

/**
 * Export report data to JSON
 */
export function exportToJSON(data: ReportData, filename: string = 'report.json'): void {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, filename, 'application/json')
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate PDF report (requires backend or library)
 */
export async function generatePDFReport(
  projectId: number,
  filename: string = 'report.pdf'
): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/report/pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw error
  }
}

/**
 * Generate HTML table for report (can be printed)
 */
export function generateHTMLReport(data: ReportData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>KHConstruct Report - ${data.project_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #2C5F8D; color: white; padding: 20px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #2C5F8D; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:hover { background-color: #f5f5f5; }
          .summary { display: flex; gap: 40px; }
          .summary-item { flex: 1; }
          .summary-item label { font-weight: bold; display: block; margin-bottom: 5px; }
          .summary-item value { font-size: 16px; color: #2C5F8D; }
          .variance-under { color: green; }
          .variance-over { color: red; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KHConstruct Project Report</h1>
          <p>Project: ${data.project_name}</p>
          ${data.completion_date ? `<p>Completion Date: ${new Date(data.completion_date).toLocaleDateString()}</p>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Cost Summary</div>
          <div class="summary">
            <div class="summary-item">
              <label>Estimated Total:</label>
              <div>£${data.estimated_costs.grand_total.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</div>
            </div>
            ${
              data.actual_costs
                ? `
              <div class="summary-item">
                <label>Actual Total:</label>
                <div>£${data.actual_costs.grand_total.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</div>
              </div>
              <div class="summary-item">
                <label>Variance:</label>
                <div class="${data.actual_costs.grand_total > data.estimated_costs.grand_total ? 'variance-over' : 'variance-under'}">
                  £${(data.actual_costs.grand_total - data.estimated_costs.grand_total).toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>

        <div class="section">
          <div class="section-title">Cost Breakdown</div>
          <table>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Subtotal</td>
              <td>£${data.estimated_costs.subtotal.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Contingency</td>
              <td>£${data.estimated_costs.contingency.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Grand Total</td>
              <td>£${data.estimated_costs.grand_total.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Line Items</div>
          <table>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Estimated</th>
              ${data.actual_costs ? '<th>Actual</th><th>Variance</th>' : ''}
            </tr>
            ${data.line_items
              .map(
                (item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.category}</td>
                <td>£${item.estimated.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</td>
                ${
                  data.actual_costs && item.actual
                    ? `
                  <td>£${item.actual.toLocaleString('en-GB', { maximumFractionDigits: 2 })}</td>
                  <td class="${item.variance && item.variance > 0 ? 'variance-over' : 'variance-under'}">
                    ${item.variance ? '£' + item.variance.toLocaleString('en-GB', { maximumFractionDigits: 2 }) : '-'}
                  </td>
                `
                    : ''
                }
              </tr>
            `
              )
              .join('')}
          </table>
        </div>

        ${
          data.notes
            ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <p>${data.notes}</p>
          </div>
        `
            : ''
        }

        <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
          <p>Generated by KHConstruct on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `
}

/**
 * Print report to PDF using browser's print functionality
 */
export function printReportToPDF(data: ReportData): void {
  const html = generateHTMLReport(data)
  const printWindow = window.open('', '', 'height=800,width=1000')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }
}

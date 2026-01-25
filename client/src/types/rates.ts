export interface RateCategory {
  id: string
  name: string
  description?: string
  isCustom: boolean
}

export interface InternalRate {
  id: string
  description: string
  category: string
  labour: number
  materials: number
  plant: number
  ohp: number
  uom: string
  createdAt: string
}

export interface CostAssemblyLineItem {
  id: string
  description: string
  source: 'internal' | 'imported' | 'custom'
  labour: number
  materials: number
  plant: number
  ohp: number
  uom: string
  quantity: number
  markupPercentage: number
  category: string
}

export interface CostAssembly {
  id: string
  projectId: number
  projectName: string
  uniqueId: string
  date: string
  lineItems: CostAssemblyLineItem[]
  globalMarkupPercentage: number
  applyGlobalMarkup: boolean
  categories: { [key: string]: CostAssemblyLineItem[] }
  createdAt: string
  updatedAt: string
}

import { useState, useMemo } from 'react'

interface PaginationResult<T> {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  currentItems: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Hook for paginating through a list of items
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 10
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage)
  }, [items.length, itemsPerPage])

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return {
    currentPage,
    totalPages,
    totalItems: items.length,
    itemsPerPage,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  }
}

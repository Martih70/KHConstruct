import axios, { AxiosError } from 'axios'

/**
 * Extract and format error messages from API responses
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>

    // Check for error message in response data
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error
    }

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }

    // Check for validation errors
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors
      if (Array.isArray(errors)) {
        return errors.map((e: any) => e.message).join(', ')
      }
    }

    // Handle HTTP status codes
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Invalid request. Please check your input.'
        case 401:
          return 'Authentication failed. Please login again.'
        case 403:
          return 'You do not have permission to perform this action.'
        case 404:
          return 'The requested resource was not found.'
        case 409:
          return 'This resource already exists.'
        case 422:
          return 'Validation failed. Please check your input.'
        case 429:
          return 'Too many requests. Please try again later.'
        case 500:
          return 'Server error. Please try again later.'
        case 503:
          return 'Service unavailable. Please try again later.'
        default:
          return `Error: ${axiosError.response.status} ${axiosError.response.statusText}`
      }
    }

    // Network error
    if (axiosError.message === 'Network Error') {
      return 'Network error. Please check your internet connection.'
    }

    return axiosError.message || 'An error occurred'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(context ? `[${context}]` : '', error)
  }
}

/**
 * Format validation errors from Zod or similar validators
 */
export function formatValidationErrors(
  errors: Record<string, string | string[]>
): Record<string, string> {
  const formatted: Record<string, string> = {}

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      formatted[field] = messages[0]
    } else {
      formatted[field] = messages
    }
  }

  return formatted
}

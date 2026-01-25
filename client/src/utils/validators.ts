/**
 * Form validation utilities
 */

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  return { valid: true }
}

export function validateRequired(value: string | number | undefined | null): { valid: boolean; error?: string } {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: 'This field is required' }
  }

  return { valid: true }
}

export function validateNumber(
  value: string | number,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' }
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `Must be at most ${max}` }
  }

  return { valid: true }
}

export function validateRange(
  value: number,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (value < min || value > max) {
    return { valid: false, error: `Must be between ${min} and ${max}` }
  }

  return { valid: true }
}

export function validateMinLength(
  value: string,
  length: number
): { valid: boolean; error?: string } {
  if (value.length < length) {
    return { valid: false, error: `Must be at least ${length} characters` }
  }

  return { valid: true }
}

export function validateMaxLength(
  value: string,
  length: number
): { valid: boolean; error?: string } {
  if (value.length > length) {
    return { valid: false, error: `Must be at most ${length} characters` }
  }

  return { valid: true }
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }

  return { valid: true }
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' }
  }

  return { valid: true }
}

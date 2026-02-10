import { CampaignStatus } from '../supabase/queries'

/**
 * Format a date for display (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a datetime for display (e.g., "Jan 15, 2024 at 3:00 PM")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Format a date for datetime-local input (e.g., "2024-01-15T15:00")
 */
export function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Format a date for date input (e.g., "2024-01-15")
 */
export function formatDateInput(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a campaign is currently active (open and not yet closed)
 */
export function isCampaignActive(opensAt: string, closesAt: string): boolean {
  const now = new Date()
  const opens = new Date(opensAt)
  const closes = new Date(closesAt)
  return now >= opens && now < closes
}

/**
 * Check if a campaign is closed
 */
export function isCampaignClosed(closesAt: string): boolean {
  const now = new Date()
  const closes = new Date(closesAt)
  return now >= closes
}

/**
 * Check if a campaign has not yet opened
 */
export function isCampaignUpcoming(opensAt: string): boolean {
  const now = new Date()
  const opens = new Date(opensAt)
  return now < opens
}

/**
 * Get the current status of a campaign based on dates and status field
 */
export function getCampaignStatus(
  opensAt: string,
  closesAt: string,
  status: CampaignStatus
): CampaignStatus {
  // If manually archived, always show archived
  if (status === 'archived') {
    return 'archived'
  }

  // If manually set to draft, show draft
  if (status === 'draft') {
    return 'draft'
  }

  // Auto-determine based on dates
  if (isCampaignClosed(closesAt)) {
    return 'closed'
  }

  if (isCampaignActive(opensAt, closesAt)) {
    return 'active'
  }

  // Not yet open, still in draft
  return 'draft'
}

/**
 * Get relative time string (e.g., "in 2 days", "3 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} min` : `${Math.abs(diffMins)} min ago`
  }

  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hr` : `${Math.abs(diffHours)} hr ago`
  }

  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`
  }

  return formatDate(dateString)
}

/**
 * Parse datetime-local input value to ISO string
 */
export function parseDateTimeLocal(value: string): string {
  return new Date(value).toISOString()
}

/**
 * Parse date input value to ISO string (at midnight UTC)
 */
export function parseDateInput(value: string): string {
  return new Date(value + 'T00:00:00Z').toISOString()
}

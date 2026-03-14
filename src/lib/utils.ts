import { format, formatDistanceToNow } from 'date-fns'

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'ANALYZED':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'READY':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case 'NEEDS_ATTENTION':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'READY':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function approvalStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function riskScoreColor(score: number): string {
  if (score >= 70) return 'text-red-600'
  if (score >= 40) return 'text-orange-500'
  if (score >= 20) return 'text-yellow-600'
  return 'text-green-600'
}
